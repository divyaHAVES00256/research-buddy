# backend/nlp_utils.py
# Keeps all text-processing logic out of main.py 
# so that the API layer stays thin and readable. Any ML changes happen here, not in the router.


import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer


# 1. SECTION SPLITTER

def split_into_sections(text: str) -> dict:

    """Split raw PDF text into named academic sections using regex pattern matching"""
    SECTION_DEFINITIONS = [
        ("abstract",     [r"abstract"]),
        ("introduction", [r"introduction", r"background"]),
        ("methodology",  [r"method(?:ology)?", r"approach", r"proposed\s+method",
                           r"experimental\s+setup", r"materials?\s+and\s+methods?"]),
        ("results",      [r"results?", r"experiments?", r"evaluation",
                           r"findings", r"performance"]),
        ("conclusion",   [r"conclusions?", r"summary", r"discussion",
                           r"concluding\s+remarks?"]),
    ]

    # Build a single regex that captures which section header was matched
    all_aliases = []
    for _, aliases in SECTION_DEFINITIONS:
        all_aliases.extend(aliases)

    header_pattern = re.compile(
        r"(?:^|\n)\s*(" + "|".join(all_aliases) + r")\s*\n",
        re.IGNORECASE
    )

    # Find every header match and record its name + position in the text
    matches = list(header_pattern.finditer(text))

    # Fallback: if no recognised headers found at all, chunk text into 5 equal parts
    if not matches:
        chunk_size = max(len(text) // 5, 1)
        fallback = {}
        for i in range(5):
            start = i * chunk_size
            end   = start + chunk_size if i < 4 else len(text)
            fallback[f"section_{i + 1}"] = text[start:end].strip()
        return fallback

    # Map each matched header string back to our canonical output key
    def canonical_key(matched_header: str) -> str:
        header_lower = matched_header.lower()
        for key, aliases in SECTION_DEFINITIONS:
            for alias in aliases:
                if re.fullmatch(alias, header_lower, re.IGNORECASE):
                    return key
        return header_lower  

    # Slice the text between consecutive headers to get section bodies
    sections = {key: "" for key, _ in SECTION_DEFINITIONS}  # pre-fill with empty strings

    for idx, match in enumerate(matches):
        key        = canonical_key(match.group(1))
        body_start = match.end()                       # text starts right after the header line
        body_end   = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        sections[key] = text[body_start:body_end].strip()

    return sections


# 2. TF-IDF KEYWORD EXTRACTION

def extract_keywords_tfidf(sections: dict, top_n: int = 8) -> dict:

    """Run TF-IDF on each section independently to extract the most important terms"""
    keywords = {}

    for section_name, section_text in sections.items():

        # Skip sections that are too short to yield meaningful keywords
        word_count = len(section_text.split())
        if word_count < 30:
            keywords[section_name] = []
            continue

        # Split section into sentences using punctuation as delimiters
        # Each sentence becomes one "document" in our mini-corpus
        sentences = re.split(r"(?<=[.!?])\s+", section_text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

        # Need at least 2 sentences to compute meaningful IDF scores
        if len(sentences) < 2:
            keywords[section_name] = []
            continue

        try:
            vectorizer = TfidfVectorizer(
                stop_words="english",
                max_features=500,
                ngram_range=(1, 2)
            )

            # Fit on sentences (our mini-corpus), then get the feature matrix
            tfidf_matrix = vectorizer.fit_transform(sentences)

            # Sum TF-IDF scores across all sentences for each term
            # np.asarray converts the sparse matrix row to a dense array first
            # axis=0 collapses across sentences → one score per term
            scores = np.asarray(tfidf_matrix.sum(axis=0)).flatten()

            # feature_names_out() gives us the vocabulary in the same column order
            # as the tfidf_matrix, so scores[i] corresponds to feature_names[i]
            feature_names = vectorizer.get_feature_names_out()

            # argsort returns indices sorted ascending; [::-1] flips to descending
            top_indices = scores.argsort()[::-1][:top_n]
            top_terms   = [feature_names[i] for i in top_indices]

            keywords[section_name] = top_terms

        except Exception:
            # If sklearn raises (e.g. all tokens are stop words), return empty list
            keywords[section_name] = []

    return keywords


# 3. STRUCTURED SUMMARY GENERATOR

def _first_sentences(text: str, n: int) -> str:

    """Helper: return the first n sentences from a block of text."""
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())

    # Filter out very short fragments 
    sentences = [s for s in sentences if len(s.split()) > 5]
    return " ".join(sentences[:n]).strip()


def _find_sentences_containing(text: str, keywords: list, n: int) -> str:
    """
    Helper: scan full text for sentences that contain any of the given keywords
    and return the first n matches joined as a string.
    """
    sentences = re.split(r"(?<=[.!?])\s+", text)
    matches = []
    for sentence in sentences:
        sentence_lower = sentence.lower()
        if any(kw in sentence_lower for kw in keywords):
            matches.append(sentence.strip())
        if len(matches) >= n:
            break
    return " ".join(matches).strip()


def generate_structured_summary(text: str, sections: dict) -> dict:
    """
    Produce a 5-field structured summary using heuristic text analysis(no llm).
    """

    # --- Problem Statement ---
    abstract_text = sections.get("abstract", "")
    if abstract_text and len(abstract_text.split()) >= 10:
        problem_statement = _first_sentences(abstract_text, 3)
    else:
        problem_statement = _first_sentences(text, 3)

    # --- Methodology ---
    methodology_text = sections.get("methodology", "")
    if methodology_text and len(methodology_text.split()) >= 15:
        methodology = _first_sentences(methodology_text, 3)
    else:
        method_keywords = [
            "we propose", "our approach", "we use", "this paper presents",
            "we introduce", "we present", "our method", "our model",
            "we design", "we develop"
        ]
        methodology = _find_sentences_containing(text, method_keywords, 2)
        if not methodology:
            methodology = "Methodology not explicitly stated in this paper."

    # --- Key Results ---
    results_text = sections.get("results", "")
    if results_text and len(results_text.split()) >= 15:
        key_results = _first_sentences(results_text, 3)
    else:
        result_keywords = [
            "accuracy", "performance", "outperform", "achieve",
            "our model", "experiment shows", "demonstrate", "we obtain",
            "state-of-the-art", "improvement", "f1", "precision", "recall"
        ]
        key_results = _find_sentences_containing(text, result_keywords, 2)
        if not key_results:
            key_results = "Key results not explicitly stated in this paper."

    # --- Limitations ---
    limitation_keywords = [
        "limitation", "drawback", "future work", "does not", "cannot",
        "fails to", "weakness", "constraint", "restricted to", "we do not"
    ]
    limitations = _find_sentences_containing(text, limitation_keywords, 2)
    if not limitations:
        limitations = "Not explicitly stated in this paper."

    # --- Future Work ---
    future_keywords = [
        "future", "further research", "next steps", "we plan",
        "we will", "can be extended", "future work", "upcoming",
        "hope to", "intend to"
    ]
    future_work = _find_sentences_containing(text, future_keywords, 2)
    if not future_work:
        future_work = "Not explicitly stated in this paper."

    return {
        "problem_statement": problem_statement,
        "methodology":       methodology,
        "key_results":       key_results,
        "limitations":       limitations,
        "future_work":       future_work,
    }


# 4. STATS COMPUTER

def compute_stats(text: str, sections: dict) -> dict:
    """
    Compute basic reading statistics for a paper.
    """
    word_count    = len(text.split())
    char_count    = len(text)

    # Count sections that actually have content (non-empty after stripping)
    section_count = sum(1 for v in sections.values() if v.strip())

    # Integer division; minimum 1 minute so we never show "0 min read"
    reading_time_minutes = max(word_count // 200, 1)

    return {
        "word_count":            word_count,
        "section_count":         section_count,
        "reading_time_minutes":  reading_time_minutes,
        "char_count":            char_count,
    }
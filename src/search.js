// =============================================
// INTELLIGENT SEARCH ENGINE
// Tokenization, stemming, synonyms, fuzzy match
// =============================================

// --- Stop words (filtered out of queries) ---
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'was', 'were',
  'are', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall',
  'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our',
  'you', 'your', 'he', 'she', 'his', 'her', 'they', 'them', 'their',
  'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very',
  'just', 'about', 'above', 'after', 'before', 'between', 'into',
  'through', 'during', 'each', 'some', 'such', 'only', 'also',
  'its', 'own', 'same', 'both', 'all', 'any', 'most', 'other'
]);

// --- Synonym map (bidirectional expansion) ---
const SYNONYM_GROUPS = [
  ['invoice', 'bill', 'receipt', 'payment'],
  ['approve', 'approval', 'accept', 'authorize', 'authorise'],
  ['reject', 'decline', 'deny', 'denial'],
  ['create', 'add', 'new', 'make'],
  ['delete', 'remove', 'erase'],
  ['edit', 'modify', 'change', 'update', 'alter'],
  ['search', 'find', 'look', 'locate', 'query'],
  ['login', 'sign in', 'authenticate', 'log in'],
  ['logout', 'sign out', 'log out'],
  ['user', 'account', 'profile'],
  ['settings', 'preferences', 'configuration', 'config'],
  ['error', 'issue', 'problem', 'bug', 'fail', 'failure'],
  ['help', 'guide', 'tutorial', 'instructions', 'documentation', 'docs'],
  ['image', 'picture', 'photo', 'screenshot'],
  ['upload', 'attach', 'import'],
  ['download', 'export', 'save'],
  ['workflow', 'process', 'pipeline', 'flow'],
  ['dashboard', 'overview', 'summary', 'home'],
  ['table', 'grid', 'list', 'spreadsheet'],
  ['report', 'analytics', 'statistics', 'stats'],
  ['vendor', 'supplier', 'provider'],
  ['customer', 'client', 'buyer'],
  ['amount', 'total', 'sum', 'price', 'cost'],
  ['status', 'state', 'progress'],
  ['date', 'time', 'period', 'deadline', 'due'],
  ['notification', 'alert', 'reminder', 'notice'],
  ['permission', 'access', 'role', 'privilege'],
];

// Build lookup: word → set of synonyms
const synonymLookup = {};
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    if (!synonymLookup[word]) synonymLookup[word] = new Set();
    for (const other of group) {
      if (other !== word) synonymLookup[word].add(other);
    }
  }
}

// --- Basic stemmer (suffix stripping) ---
function stem(word) {
  if (word.length < 4) return word;

  // Common suffix rules (order matters — most specific first)
  const rules = [
    [/ational$/, 'ate'],
    [/tional$/, 'tion'],
    [/fulness$/, 'ful'],
    [/ousness$/, 'ous'],
    [/iveness$/, 'ive'],
    [/ization$/, 'ize'],
    [/isation$/, 'ise'],
    [/ibilities$/, 'ible'],
    [/ically$/, 'ic'],
    [/lessly$/, 'less'],
    [/ments$/, 'ment'],
    [/ities$/, 'ity'],
    [/ating$/, 'ate'],
    [/ising$/, 'ise'],
    [/izing$/, 'ize'],
    [/ement$/, 'e'],
    [/ness$/, ''],
    [/ment$/, ''],
    [/able$/, ''],
    [/ible$/, ''],
    [/tion$/, 't'],
    [/sion$/, 's'],
    [/ally$/, 'al'],
    [/ful$/, ''],
    [/ous$/, ''],
    [/ive$/, ''],
    [/ies$/, 'y'],
    [/ing$/, ''],
    [/ely$/, 'e'],
    [/ion$/, ''],
    [/ed$/, ''],
    [/ly$/, ''],
    [/er$/, ''],
    [/es$/, ''],
    [/al$/, ''],
    [/s$/, ''],
  ];

  for (const [pattern, replacement] of rules) {
    if (pattern.test(word)) {
      const stemmed = word.replace(pattern, replacement);
      // Don't stem too aggressively — keep at least 3 chars
      if (stemmed.length >= 3) return stemmed;
    }
  }

  return word;
}

// --- Levenshtein distance (for fuzzy matching) ---
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost  // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

// --- Tokenize query ---
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
}

// --- Strip HTML to plain text ---
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

// --- Get synonyms for a word ---
function getSynonyms(word) {
  const syns = new Set();
  // Check the word itself
  if (synonymLookup[word]) {
    synonymLookup[word].forEach(s => syns.add(s));
  }
  // Check stemmed form
  const stemmed = stem(word);
  if (synonymLookup[stemmed]) {
    synonymLookup[stemmed].forEach(s => syns.add(s));
  }
  return [...syns];
}

// --- Check if a word fuzzy-matches target ---
function fuzzyMatch(query, target, maxDist) {
  if (query === target) return { match: true, exact: true, distance: 0 };
  if (target.includes(query)) return { match: true, exact: false, distance: 0, partial: true };
  if (query.includes(target)) return { match: true, exact: false, distance: 0, partial: true };

  const dist = levenshtein(query, target);
  if (dist <= maxDist) return { match: true, exact: false, distance: dist };

  return { match: false };
}

// --- Main search function ---
function smartSearch(guides, rawQuery) {
  const query = rawQuery.trim();
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  const tokens = tokenize(query);

  // If all tokens were stop words, use original query as single token
  if (tokens.length === 0) {
    const fallback = queryLower.replace(/[^\w\s-]/g, '').trim();
    if (fallback.length >= 2) tokens.push(fallback);
    else return [];
  }

  // Prepare stemmed tokens and synonym expansions
  const tokenData = tokens.map(token => {
    const stemmed = stem(token);
    const synonyms = getSynonyms(token);
    const synonymStems = synonyms.map(s => stem(s));
    return {
      original: token,
      stemmed,
      synonyms,
      synonymStems,
      // Max fuzzy distance based on word length
      maxDist: token.length <= 4 ? 1 : token.length <= 7 ? 2 : 3
    };
  });

  const scoredResults = [];

  for (const guide of guides) {
    const plainContent = stripHtml(guide.content || '');
    const titleLower = guide.title.toLowerCase();
    const contentLower = plainContent.toLowerCase();
    const titleWords = tokenize(guide.title);
    const contentWords = tokenize(plainContent);

    let score = 0;
    let matchedTokens = 0;
    const matchTypes = new Set(); // 'exact', 'stem', 'synonym', 'fuzzy'
    const matchedTerms = []; // for highlighting

    // === Score each token ===
    for (const td of tokenData) {
      let tokenScore = 0;
      let tokenMatched = false;

      // --- 1. Exact match ---
      // Title exact
      if (titleLower.includes(td.original)) {
        tokenScore += 40;
        tokenMatched = true;
        matchTypes.add('exact');
        matchedTerms.push(td.original);
      }
      // Content exact
      if (contentLower.includes(td.original)) {
        tokenScore += 10;
        tokenMatched = true;
        matchTypes.add('exact');
        if (!matchedTerms.includes(td.original)) matchedTerms.push(td.original);
      }

      // --- 2. Stem match ---
      if (!tokenMatched || tokenScore < 40) {
        for (const tw of titleWords) {
          if (stem(tw) === td.stemmed && tw !== td.original) {
            tokenScore += 30;
            tokenMatched = true;
            matchTypes.add('stem');
            matchedTerms.push(tw);
            break;
          }
        }
        for (const cw of contentWords) {
          if (stem(cw) === td.stemmed && cw !== td.original) {
            tokenScore += 8;
            tokenMatched = true;
            matchTypes.add('stem');
            if (!matchedTerms.includes(cw)) matchedTerms.push(cw);
            break;
          }
        }
      }

      // --- 3. Synonym match ---
      if (!tokenMatched || tokenScore < 30) {
        for (const syn of td.synonyms) {
          if (titleLower.includes(syn)) {
            tokenScore += 20;
            tokenMatched = true;
            matchTypes.add('synonym');
            matchedTerms.push(syn);
            break;
          }
        }
        for (const syn of td.synonyms) {
          if (contentLower.includes(syn)) {
            tokenScore += 6;
            tokenMatched = true;
            matchTypes.add('synonym');
            if (!matchedTerms.includes(syn)) matchedTerms.push(syn);
            break;
          }
        }
        // Synonym stem match
        if (!tokenMatched) {
          for (let i = 0; i < td.synonymStems.length; i++) {
            const synStem = td.synonymStems[i];
            for (const tw of titleWords) {
              if (stem(tw) === synStem) {
                tokenScore += 15;
                tokenMatched = true;
                matchTypes.add('synonym');
                matchedTerms.push(tw);
                break;
              }
            }
            if (tokenMatched) break;
            for (const cw of contentWords) {
              if (stem(cw) === synStem) {
                tokenScore += 5;
                tokenMatched = true;
                matchTypes.add('synonym');
                if (!matchedTerms.includes(cw)) matchedTerms.push(cw);
                break;
              }
            }
            if (tokenMatched) break;
          }
        }
      }

      // --- 4. Fuzzy match (typo tolerance) ---
      if (!tokenMatched) {
        // Check title words
        for (const tw of titleWords) {
          const fm = fuzzyMatch(td.original, tw, td.maxDist);
          if (fm.match && !fm.partial) {
            tokenScore += Math.max(1, 15 - fm.distance * 5);
            tokenMatched = true;
            matchTypes.add('fuzzy');
            matchedTerms.push(tw);
            break;
          }
        }
        // Check content words (sample — don't check every single word)
        if (!tokenMatched) {
          const sampleWords = contentWords.slice(0, 500);
          for (const cw of sampleWords) {
            const fm = fuzzyMatch(td.original, cw, td.maxDist);
            if (fm.match && !fm.partial) {
              tokenScore += Math.max(1, 5 - fm.distance * 2);
              tokenMatched = true;
              matchTypes.add('fuzzy');
              if (!matchedTerms.includes(cw)) matchedTerms.push(cw);
              break;
            }
          }
        }
      }

      if (tokenMatched) matchedTokens++;
      score += tokenScore;
    }

    // === Bonuses ===

    // Exact phrase match bonus
    if (tokens.length > 1 && titleLower.includes(queryLower)) {
      score += 50;
      matchTypes.add('exact');
    }
    if (tokens.length > 1 && contentLower.includes(queryLower)) {
      score += 20;
    }

    // All tokens matched bonus
    if (matchedTokens === tokenData.length && tokenData.length > 1) {
      score += 25;
    }

    // Skip if nothing matched
    if (score === 0) continue;

    // Ratio of matched tokens (partial match penalty)
    const matchRatio = matchedTokens / tokenData.length;
    if (matchRatio < 0.5 && tokenData.length > 2) continue; // skip if less than half matched for multi-word queries

    // --- Extract section-level matches ---
    const sections = extractSections(guide, tokenData, matchedTerms, queryLower);

    // Build match type label
    let matchLabel = 'exact match';
    if (matchTypes.has('fuzzy') && !matchTypes.has('exact') && !matchTypes.has('stem')) {
      matchLabel = 'fuzzy match';
    } else if (matchTypes.has('synonym') && !matchTypes.has('exact')) {
      matchLabel = 'related match';
    } else if (matchTypes.has('stem') && !matchTypes.has('exact')) {
      matchLabel = 'similar match';
    }

    scoredResults.push({
      title: guide.title,
      slug: guide.slug,
      updatedAt: guide.updated_at,
      score: Math.round(score * matchRatio * 10) / 10,
      matchLabel,
      matchedTerms: [...new Set(matchedTerms)].slice(0, 6),
      titleMatch: titleLower.includes(queryLower) || titleWords.some(tw => tokenData.some(td => td.original === tw || stem(tw) === td.stemmed)),
      sections: sections.slice(0, 5),
      summary: plainContent.substring(0, 150) + (plainContent.length > 150 ? '...' : '')
    });
  }

  // Sort by score descending
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.slice(0, 10);
}

// --- Helper: simulate browser .textContent (strips tags without adding spaces) ---
function textContent(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&[^;]+;/g, ' ').trim();
}

// --- Generate anchor ID matching what guide viewer produces ---
function toAnchorId(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);
}

// --- Extract section-level matches ---
function extractSections(guide, tokenData, matchedTerms, queryLower) {
  const sections = [];
  if (!guide.content) return sections;

  // Match full opening tag to capture id attribute, then content
  const headingRegex = /<(h[1-4]|div)\s+[^>]*(?:class="[^"]*(?:section-heading|sub-heading|sub2-heading)[^"]*"|(?=))[^>]*>([\s\S]*?)<\/(?:h[1-4]|div)>/gi;
  // Also match plain h2/h3 without class
  const plainHeadingRegex = /<(h[2-3])(?:\s[^>]*)?>([^<](?:[\s\S]*?))<\/\1>/gi;

  // Collect all headings with their full opening tag (for id extraction)
  const allHeadingMatches = [];
  const fullTagRegex = /<(h[1-4])(\s[^>]*)?>(([\s\S]*?))<\/\1>/gi;
  let m;
  while ((m = fullTagRegex.exec(guide.content)) !== null) {
    const tag = m[1];
    const attrs = m[2] || '';
    const inner = m[3];

    // Extract existing id attribute from the tag
    const idMatch = attrs.match(/id="([^"]+)"/);
    const origId = idMatch ? idMatch[1] : '';

    // Get heading text two ways:
    // 1. textContent style (what browser sees) — strips tags without spaces
    const browserText = textContent(inner);
    // 2. stripHtml style (replaces tags with spaces)
    const searchText = stripHtml(inner);

    if (!browserText && !searchText) continue;
    const displayText = searchText || browserText;

    allHeadingMatches.push({
      heading: displayText,
      browserText,
      origId,
      index: m.index,
      fullLength: m[0].length,
      inner
    });
  }

  for (let i = 0; i < allHeadingMatches.length; i++) {
    const hm = allHeadingMatches[i];
    if (!hm.heading) continue;

    // Get section content (until next heading)
    const afterPos = hm.index + hm.fullLength;
    let endPos = guide.content.length;
    if (i + 1 < allHeadingMatches.length) {
      endPos = allHeadingMatches[i + 1].index;
    }
    const sectionContent = stripHtml(guide.content.substring(afterPos, Math.min(afterPos + 500, endPos)));

    const sectionText = (hm.heading + ' ' + sectionContent).toLowerCase();

    // Check if any token hits this section
    let sectionMatched = false;
    let bestMatchTerm = '';

    if (sectionText.includes(queryLower)) {
      sectionMatched = true;
      bestMatchTerm = queryLower;
    }

    if (!sectionMatched) {
      for (const td of tokenData) {
        if (sectionText.includes(td.original)) {
          sectionMatched = true;
          bestMatchTerm = td.original;
          break;
        }
        if (sectionText.includes(td.stemmed) && td.stemmed !== td.original) {
          sectionMatched = true;
          bestMatchTerm = td.stemmed;
          break;
        }
        for (const syn of td.synonyms) {
          if (sectionText.includes(syn)) {
            sectionMatched = true;
            bestMatchTerm = syn;
            break;
          }
        }
        if (sectionMatched) break;
      }
    }

    if (!sectionMatched) {
      for (const mt of matchedTerms) {
        if (sectionText.includes(mt)) {
          sectionMatched = true;
          bestMatchTerm = mt;
          break;
        }
      }
    }

    if (!sectionMatched) continue;

    // Build snippet
    const fullText = hm.heading + ' \u2014 ' + sectionContent;
    const idx = fullText.toLowerCase().indexOf(bestMatchTerm);
    let snippet = '';
    if (idx >= 0) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(fullText.length, idx + bestMatchTerm.length + 60);
      snippet = (start > 0 ? '...' : '') + fullText.substring(start, end) + (end < fullText.length ? '...' : '');
    } else {
      snippet = sectionContent.substring(0, 120) + (sectionContent.length > 120 ? '...' : '');
    }

    // Generate anchor ID — use the original content id if available (this is what the
    // guide viewer will keep as the primary ID). Otherwise generate from textContent.
    let anchorId;
    if (hm.origId) {
      anchorId = hm.origId;
    } else {
      // Match browser textContent behavior (no spaces from stripped tags)
      anchorId = toAnchorId(hm.browserText);
    }

    sections.push({ heading: hm.heading, snippet, anchorId });
  }

  return sections;
}

// --- Build SQL patterns for all tokens + expansions (for DB pre-filter) ---
function buildSearchPatterns(rawQuery) {
  const tokens = tokenize(rawQuery);
  if (tokens.length === 0) {
    const fallback = rawQuery.toLowerCase().replace(/[^\w\s-]/g, '').trim();
    if (fallback.length >= 2) return [`%${fallback}%`];
    return [];
  }

  const patterns = new Set();

  // Always include the raw query
  patterns.add(`%${rawQuery.toLowerCase()}%`);

  for (const token of tokens) {
    patterns.add(`%${token}%`);
    const stemmed = stem(token);
    if (stemmed !== token && stemmed.length >= 3) {
      patterns.add(`%${stemmed}%`);
    }
    // Add synonym patterns
    const syns = getSynonyms(token);
    for (const syn of syns.slice(0, 3)) { // limit to avoid too many queries
      patterns.add(`%${syn}%`);
    }
  }

  return [...patterns];
}

// --- Detect if query is a question ---
function isQuestion(query) {
  const q = query.toLowerCase().trim();
  const questionStarters = [
    'how', 'what', 'where', 'when', 'why', 'who', 'which',
    'can i', 'can you', 'do i', 'do we', 'does', 'is there',
    'is it', 'are there', 'should i', 'could i', 'would',
    'tell me', 'show me', 'explain', 'help me', 'i want to',
    'i need to', 'how to', 'how do', 'how can', 'what is',
    'what are', 'where is', 'where do', 'where can'
  ];
  if (q.endsWith('?')) return true;
  return questionStarters.some(s => q.startsWith(s));
}

// --- Generate a direct answer for a question ---
function generateAnswer(guides, rawQuery, searchResults) {
  if (!isQuestion(rawQuery) || searchResults.length === 0) return null;

  const queryLower = rawQuery.toLowerCase();
  const tokens = tokenize(rawQuery);
  if (tokens.length === 0) return null;

  // Use the best-scoring result
  const best = searchResults[0];
  const guide = guides.find(g => g.slug === best.slug);
  if (!guide || !guide.content) return null;

  const plainContent = stripHtml(guide.content);

  // Try to find the best paragraph-level answer
  // Split content into paragraphs
  const paragraphs = guide.content
    .split(/<\/p>|<\/div>|<\/li>|<br\s*\/?>|<\/tr>/)
    .map(p => stripHtml(p))
    .filter(p => p.length > 30 && p.length < 600);

  let bestParagraph = '';
  let bestParaScore = 0;

  for (const para of paragraphs) {
    const paraLower = para.toLowerCase();
    let paraScore = 0;

    // Score based on how many tokens appear in this paragraph
    for (const token of tokens) {
      if (paraLower.includes(token)) paraScore += 10;
      // Check stems
      const stemmed = stem(token);
      if (stemmed !== token && paraLower.includes(stemmed)) paraScore += 7;
      // Check synonyms
      const syns = getSynonyms(token);
      for (const syn of syns) {
        if (paraLower.includes(syn)) { paraScore += 4; break; }
      }
    }

    // Bonus for paragraphs that contain action words matching question type
    if (queryLower.startsWith('how')) {
      // Prefer paragraphs with instructional language
      if (/\b(click|go to|navigate|select|open|press|enter|choose|tap|drag)\b/i.test(para)) paraScore += 8;
      if (/\b(step|first|then|next|finally)\b/i.test(para)) paraScore += 5;
    }
    if (queryLower.startsWith('what')) {
      // Prefer paragraphs with definitional language
      if (/\b(is a|is the|are the|refers to|means|provides|allows)\b/i.test(para)) paraScore += 8;
    }
    if (queryLower.startsWith('where')) {
      if (/\b(found in|located|go to|navigate|menu|tab|page|section)\b/i.test(para)) paraScore += 8;
    }

    // Prefer moderately-sized paragraphs (not too short, not too long)
    if (para.length > 50 && para.length < 300) paraScore += 3;

    if (paraScore > bestParaScore) {
      bestParaScore = paraScore;
      bestParagraph = para;
    }
  }

  if (!bestParagraph || bestParaScore < 10) {
    // Fall back to the best section snippet
    if (best.sections.length > 0) {
      return {
        text: best.sections[0].snippet,
        heading: best.sections[0].heading,
        guideTitle: best.title,
        slug: best.slug,
        anchorId: best.sections[0].anchorId,
        confidence: 'low'
      };
    }
    return null;
  }

  // Trim answer to a reasonable length
  let answer = bestParagraph;
  if (answer.length > 300) {
    // Try to cut at a sentence boundary
    const sentenceEnd = answer.indexOf('. ', 150);
    if (sentenceEnd > 0 && sentenceEnd < 350) {
      answer = answer.substring(0, sentenceEnd + 1);
    } else {
      answer = answer.substring(0, 300) + '...';
    }
  }

  // Find which section this paragraph belongs to
  let answerHeading = '';
  let answerAnchorId = '';
  if (best.sections.length > 0) {
    // Find the section whose snippet best overlaps with the answer
    let bestOverlap = 0;
    for (const sec of best.sections) {
      const words = sec.snippet.toLowerCase().split(/\s+/);
      let overlap = 0;
      for (const w of words) {
        if (w.length > 3 && answer.toLowerCase().includes(w)) overlap++;
      }
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        answerHeading = sec.heading;
        answerAnchorId = sec.anchorId;
      }
    }
    // If no overlap found, use the first section
    if (!answerHeading && best.sections[0]) {
      answerHeading = best.sections[0].heading;
      answerAnchorId = best.sections[0].anchorId;
    }
  }

  return {
    text: answer,
    heading: answerHeading,
    guideTitle: best.title,
    slug: best.slug,
    anchorId: answerAnchorId,
    confidence: bestParaScore >= 20 ? 'high' : 'medium'
  };
}

module.exports = {
  smartSearch,
  buildSearchPatterns,
  generateAnswer,
  isQuestion,
  tokenize,
  stem,
  getSynonyms,
  stripHtml,
};

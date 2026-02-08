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

// --- Extract section-level matches ---
function extractSections(guide, tokenData, matchedTerms, queryLower) {
  const sections = [];
  if (!guide.content) return sections;

  const headingRegex = /<(h[1-4]|div\s+class="[^"]*(?:section-heading|sub-heading|sub2-heading)[^"]*")[^>]*>([\s\S]*?)<\/(?:h[1-4]|div)>/gi;
  let match;

  while ((match = headingRegex.exec(guide.content)) !== null) {
    const headingText = stripHtml(match[2]);
    if (!headingText) continue;

    // Get section content
    const afterPos = match.index + match[0].length;
    const nextHeading = guide.content.indexOf('<h', afterPos);
    const nextDiv = guide.content.indexOf('<div class="section-heading', afterPos);
    let endPos = guide.content.length;
    if (nextHeading > 0 && nextHeading < endPos) endPos = nextHeading;
    if (nextDiv > 0 && nextDiv < endPos) endPos = nextDiv;
    const sectionContent = stripHtml(guide.content.substring(afterPos, Math.min(afterPos + 500, endPos)));

    const sectionText = (headingText + ' ' + sectionContent).toLowerCase();

    // Check if any token (original, stemmed, synonym, or matched term) hits this section
    let sectionMatched = false;
    let bestMatchTerm = '';

    // Check exact query
    if (sectionText.includes(queryLower)) {
      sectionMatched = true;
      bestMatchTerm = queryLower;
    }

    // Check individual tokens and their expansions
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

    // Check matched terms from fuzzy matching
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

    // Build snippet around the match
    const fullText = headingText + ' \u2014 ' + sectionContent;
    const idx = fullText.toLowerCase().indexOf(bestMatchTerm);
    let snippet = '';
    if (idx >= 0) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(fullText.length, idx + bestMatchTerm.length + 60);
      snippet = (start > 0 ? '...' : '') + fullText.substring(start, end) + (end < fullText.length ? '...' : '');
    } else {
      snippet = sectionContent.substring(0, 120) + (sectionContent.length > 120 ? '...' : '');
    }

    const anchorId = headingText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);

    sections.push({ heading: headingText, snippet, anchorId });
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

module.exports = {
  smartSearch,
  buildSearchPatterns,
  tokenize,
  stem,
  getSynonyms,
  stripHtml,
};

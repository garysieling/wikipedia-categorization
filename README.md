# wikipedia-categorization
Text categorization of talks based on Wikipedia's topic taxonomy.

Steps:
- Follow Wikipedia taxononomy tree
- Get articles under each category
- Extract the text from each article
- Convert text to phenomes (sounds)
- Run through Facebook's fasttext / starspace tools

Examples:

See how many articles are available in each category:
```
node stats.js
```

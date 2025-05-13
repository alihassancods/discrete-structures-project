document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // --- Theme Toggle Logic ---
    const currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.checked = true;
    } else {
        body.classList.remove('dark-theme');
        themeToggle.checked = false;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Tab Navigation Logic ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- Helper Functions ---
    function displayError(elementId, message) {
        const feedbackElement = document.getElementById(`${elementId}-feedback`);
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.style.color = 'var(--error-color)';
            const inputElement = document.getElementById(elementId);
            if(inputElement) {
                inputElement.style.borderColor = 'var(--error-color)';
            }
        }
    }

     function displaySuccess(elementId, message) {
        const feedbackElement = document.getElementById(`${elementId}-feedback`);
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.style.color = 'var(--success-color)';
            const inputElement = document.getElementById(elementId);
             if(inputElement) {
                inputElement.style.borderColor = 'var(--success-color)';
            }
        }
    }

     function clearFeedback(elementId) {
        const feedbackElement = document.getElementById(`${elementId}-feedback`);
        if (feedbackElement) {
            feedbackElement.textContent = '';
             const inputElement = document.getElementById(elementId);
             if(inputElement) {
                inputElement.style.borderColor = ''; // Reset border color
             }
        }
     }

    function formatCodeBlock(content) {
        return `<pre><code class="code-block">${content}</code></pre>`;
    }

    // --- Propositional Logic ---
    const logicExpressionInput = document.getElementById('logic-expression');
    const evaluateLogicButton = document.getElementById('evaluate-logic');
    const logicTruthTableOutput = document.getElementById('logic-truth-table');

    // Basic validation on input
    logicExpressionInput.addEventListener('input', () => {
        const expression = logicExpressionInput.value;
        // Simple check: does it contain valid chars? Does '(' count match ')'?
        if (!/^[a-zA-Z()&\s|~!-><=>]*$/.test(expression)) {
             displayError('logic-expression', 'Contains invalid characters.');
        } else if ((expression.split('(').length - 1) !== (expression.split(')').length - 1)) {
             displayError('logic-expression', 'Mismatched parentheses.');
        } else {
             clearFeedback('logic-expression');
        }
    });


    evaluateLogicButton.addEventListener('click', () => {
        const expression = logicExpressionInput.value.trim();
        if (!expression) {
            displayError('logic-expression', 'Please enter a logical expression.');
            logicTruthTableOutput.innerHTML = '';
            return;
        }
        clearFeedback('logic-expression');

        try {
            const { tableHTML, error } = generateTruthTable(expression);
            if (error) {
                displayError('logic-expression', 'Parsing or evaluation error: ' + error);
                 logicTruthTableOutput.innerHTML = '';
            } else {
                 displaySuccess('logic-expression', 'Expression evaluated successfully.');
                 logicTruthTableOutput.innerHTML = tableHTML; // Insert the raw table HTML
            }
        } catch (e) {
             displayError('logic-expression', 'An unexpected error occurred: ' + e.message);
             logicTruthTableOutput.innerHTML = '';
        }
    });

    // Simple Parser and Evaluator (Shunting-Yard & RPN Evaluation approach is robust but complex for vanilla. Let's use a direct recursive evaluation assuming simplified format)
    // NOTE: This is a *very* simplified approach for demonstration. A real parser is much more complex.
    // Assumes input is already reasonably well-formed with keywords AND, OR, NOT, IF THEN, IFF.
     // It will struggle with complex nested structures or unusual spacing/symbols without careful handling.

     function parseLogicalExpression(expression) {
        // Basic tokenization and conversion to a more consistent format
        let tokens = expression.toUpperCase()
            .replace(/\(/g, ' ( ')
            .replace(/\)/g, ' ) ')
            .replace(/NOT|!|~/g, ' NOT ')
            .replace(/AND|&/g, ' AND ')
            .replace(/OR|\|/g, ' OR ')
            .replace(/IF THEN|->/g, ' IFTHEN ')
            .replace(/IFF|<-?>|<=>/g, ' IFF ')
            .split(/\s+/)
            .filter(token => token !== '');

        // Variables are single letters
        const variables = new Set();
        tokens.forEach(token => {
            if (/^[A-Z]$/.test(token)) {
                variables.add(token);
            }
        });

        // This simple structure doesn't build an AST.
        // A more robust approach would build an AST or convert to RPN.
        // For this demo, we'll rely on string replacement and basic evaluation logic.
        // This is the main limitation of the vanilla JS approach for complex parsing.
        // A real-world app would use a grammar and parser combinators/generators.

        // For simplicity, we'll just return tokens and variables.
        // The evaluation will work directly on the tokens assuming simple structure
        // OR rely on JS's eval (dangerous!) or a custom recursive evaluator (complex!).
        // Let's try a custom recursive evaluator on simplified tokens.

         return { tokens, variables: Array.from(variables).sort() }; // Sort variables alphabetically
     }

     // Evaluate a simplified token list or string expression recursively
     // WARNING: This is a highly simplified recursive descent like approach for demo purposes.
     // It assumes precedence (NOT > AND > OR > IFTHEN > IFF) and relies on parentheses.
     function evaluateLogic(tokens, varValues) {
         if (!tokens || tokens.length === 0) return false; // Should not happen with valid input

         // Helper to find closing parenthesis for a given opening one
         function findClosingParen(startIdx) {
             let balance = 1;
             for (let i = startIdx + 1; i < tokens.length; i++) {
                 if (tokens[i] === '(') balance++;
                 if (tokens[i] === ')') balance--;
                 if (balance === 0) return i;
             }
             return -1; // Error: No closing parenthesis
         }

         let currentTokens = [...tokens]; // Work on a copy

         // Step 1: Evaluate innermost parentheses first (recursive step)
         while (currentTokens.includes('(')) {
             let openIdx = currentTokens.lastIndexOf('('); // Start from the last '(' to handle innermost first
             let closeIdx = findClosingParen(openIdx);

             if (closeIdx === -1) throw new Error("Mismatched parentheses during evaluation.");

             const subExpressionTokens = currentTokens.slice(openIdx + 1, closeIdx);
             const subResult = evaluateLogic(subExpressionTokens, varValues); // Recursive call

             // Replace the entire parenthesized sub-expression with its boolean result
             currentTokens.splice(openIdx, closeIdx - openIdx + 1, subResult ? 'TRUE' : 'FALSE');
         }

          // Now tokens are either TRUE/FALSE, variables, or operators (NOT, AND, OR, IFTHEN, IFF)

         // Step 2: Replace variables with their values
         for (let i = 0; i < currentTokens.length; i++) {
             const token = currentTokens[i];
             if (/^[A-Z]$/.test(token)) {
                 currentTokens[i] = varValues[token] ? 'TRUE' : 'FALSE';
             }
         }

          // Step 3: Evaluate operators based on precedence (NOT, AND, OR, IFTHEN, IFF)
          // Perform NOT operations
          while(currentTokens.includes('NOT')) {
              const notIdx = currentTokens.indexOf('NOT');
              const nextToken = currentTokens[notIdx + 1];
              if (nextToken === 'TRUE') {
                  currentTokens.splice(notIdx, 2, 'FALSE');
              } else if (nextToken === 'FALSE') {
                  currentTokens.splice(notIdx, 2, 'TRUE');
              } else {
                  throw new Error("Invalid NOT operation syntax."); // NOT must be followed by a boolean value/variable
              }
          }

           // Perform AND operations
           while(currentTokens.includes('AND')) {
               const andIdx = currentTokens.indexOf('AND');
               const left = currentTokens[andIdx - 1];
               const right = currentTokens[andIdx + 1];

               if (left === 'TRUE' || left === 'FALSE' && right === 'TRUE' || right === 'FALSE') {
                    const result = (left === 'TRUE') && (right === 'TRUE');
                    currentTokens.splice(andIdx - 1, 3, result ? 'TRUE' : 'FALSE');
               } else {
                    throw new Error("Invalid AND operation syntax.");
               }
           }

            // Perform OR operations
            while(currentTokens.includes('OR')) {
                const orIdx = currentTokens.indexOf('OR');
                const left = currentTokens[orIdx - 1];
                const right = currentTokens[orIdx + 1];

                if (left === 'TRUE' || left === 'FALSE' && right === 'TRUE' || right === 'FALSE') {
                    const result = (left === 'TRUE') || (right === 'TRUE');
                     currentTokens.splice(orIdx - 1, 3, result ? 'TRUE' : 'FALSE');
                } else {
                    throw new Error("Invalid OR operation syntax.");
                }
            }

             // Perform IFTHEN operations (p -> q is !p || q)
             while(currentTokens.includes('IFTHEN')) {
                 const ifthenIdx = currentTokens.indexOf('IFTHEN');
                 const antecedent = currentTokens[ifthenIdx - 1];
                 const consequent = currentTokens[ifthenIdx + 1];

                 if (antecedent === 'TRUE' || antecedent === 'FALSE' && consequent === 'TRUE' || consequent === 'FALSE') {
                     // Using the equivalence: (A -> B) is logically equivalent to (!A || B)
                     const result = (antecedent === 'FALSE') || (consequent === 'TRUE');
                     currentTokens.splice(ifthenIdx - 1, 3, result ? 'TRUE' : 'FALSE');
                 } else {
                     throw new Error("Invalid IF THEN operation syntax.");
                 }
             }


            // Perform IFF operations (p <-> q is (p -> q) AND (q -> p))
            while(currentTokens.includes('IFF')) {
                const iffIdx = currentTokens.indexOf('IFF');
                const left = currentTokens[iffIdx - 1];
                const right = currentTokens[iffIdx + 1];

                 if (left === 'TRUE' || left === 'FALSE' && right === 'TRUE' || right === 'FALSE') {
                    // Using the equivalence: (A <-> B) is logically equivalent to (A AND B) OR (NOT A AND NOT B)
                    const result = (left === 'TRUE' && right === 'TRUE') || (left === 'FALSE' && right === 'FALSE');
                    currentTokens.splice(iffIdx - 1, 3, result ? 'TRUE' : 'FALSE');
                } else {
                    throw new Error("Invalid IFF operation syntax.");
                }
            }


         // After all operations, there should be a single boolean token left
         if (currentTokens.length !== 1 || (currentTokens[0] !== 'TRUE' && currentTokens[0] !== 'FALSE')) {
            // This might happen if the parsing/evaluation logic failed or input was malformed
            throw new Error("Evaluation failed. Check expression syntax.");
         }

         return currentTokens[0] === 'TRUE';
     }


    function generateTruthTable(expression) {
        try {
            const { tokens, variables } = parseLogicalExpression(expression);

            if (variables.length === 0) {
                 // Handle expressions with no variables (constants like "TRUE", "NOT FALSE")
                 try {
                      const result = evaluateLogic(tokens, {}); // Evaluate with empty variables
                      const resultText = result ? 'TRUE' : 'FALSE';
                       let html = `<table><thead><tr><th>Expression</th><th>Result</th></tr></thead><tbody><tr><td>${expression}</td><td>${resultText}</td></tr></tbody></table>`;
                       return { tableHTML: html };
                 } catch (e) {
                     return { error: 'Could not evaluate constant expression: ' + e.message };
                 }
            }

            if (variables.length > 5) { // Limit variables for performance
                 return { error: `Too many variables (${variables.length}). Maximum is 5 for performance.` };
            }

            const numRows = Math.pow(2, variables.length);
            let tableHTML = '<table><thead><tr>';

            // Add variable headers
            variables.forEach(v => { tableHTML += `<th>${v}</th>`; });

            // Add expression header
            tableHTML += `<th>${expression}</th></tr></thead><tbody>`;

            // Generate rows
            for (let i = 0; i < numRows; i++) {
                tableHTML += '<tr>';
                const varValues = {}; // Truth values for this row

                // Determine truth values for each variable in this row
                for (let j = 0; j < variables.length; j++) {
                    // Bit manipulation to determine truth value (0=False, 1=True)
                    const value = (i >> (variables.length - 1 - j)) & 1;
                    varValues[variables[j]] = value === 1;
                    tableHTML += `<td>${value === 1 ? 'T' : 'F'}</td>`;
                }

                // Evaluate the expression for these variable values
                try {
                    const result = evaluateLogic(tokens, varValues);
                    tableHTML += `<td>${result ? 'T' : 'F'}</td>`;
                } catch (e) {
                     // If evaluation fails for a specific row, mark it
                     tableHTML += `<td style="color: var(--error-color);">ERROR: ${e.message}</td>`;
                     // Optionally, propagate the error up or log it
                     console.error("Evaluation error for row:", varValues, e);
                }


                tableHTML += '</tr>';
            }

            tableHTML += '</tbody></table>';
            return { tableHTML: tableHTML };

        } catch (e) {
            return { error: e.message };
        }
    }


    // --- Set Operations ---
    const setUInput = document.getElementById('set-u');
    const setAInput = document.getElementById('set-a');
    const setBInput = document.getElementById('set-b');
    const setOperationButtons = document.querySelectorAll('.set-operations-buttons button');
    const setResultsOutput = document.getElementById('set-results');

     // Basic validation on set inputs
    const setInputs = [setUInput, setAInput, setBInput];
    setInputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = input.value.trim();
             if (value && !/^{.*}$/.test(value)) {
                 displayError(input.id, 'Set must be enclosed in curly braces {}.');
             } else {
                 clearFeedback(input.id);
             }
        });
    });


    function parseSet(inputString) {
        const trimmed = inputString.trim();
        if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
            throw new Error("Set must be enclosed in curly braces {}.");
        }
        const content = trimmed.substring(1, trimmed.length - 1);
         if (content.trim() === '') return new Set(); // Handle empty set {}

        // This split handles commas, but needs refinement for nested structures if supported
        // For simplicity, assuming basic elements like numbers, strings, unquoted words
        const elements = content.split(',').map(item => {
            item = item.trim();
            // Attempt to convert to number if possible
            if (!isNaN(item) && item !== '') return parseFloat(item);
            // Remove quotes if present
            if (item.startsWith('"') && item.endsWith('"')) return item.substring(1, item.length - 1);
             if (item.startsWith("'") && item.endsWith("'")) return item.substring(1, item.length - 1);
            return item; // Treat as string
        });
        return new Set(elements);
    }

    function setToArray(set) {
         // Convert set to array, sort for consistent display (basic sort)
        return Array.from(set).sort((a, b) => {
            // Simple sorting: numbers before strings, then alphabetical/numerical
            if (typeof a === 'number' && typeof b !== 'number') return -1;
            if (typeof a !== 'number' && typeof b === 'number') return 1;
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
    }

    function setsEqual(set1, set2) {
        if (set1.size !== set2.size) return false;
        for (let item of set1) {
            if (!set2.has(item)) return false;
        }
        return true;
    }


    setOperationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const operation = button.dataset.op;
            const uString = setUInput.value.trim();
            const aString = setAInput.value.trim();
            const bString = setBInput.value.trim();
            let result = '';
            let error = '';

             clearFeedback('set-u');
             clearFeedback('set-a');
             clearFeedback('set-b');


            try {
                const setA = parseSet(aString);
                const setB = parseSet(bString);
                let setU = new Set();

                 if (operation.includes('complement')) {
                     if (!uString) {
                         displayError('set-u', 'Universal Set is required for complement.');
                         setResultsOutput.innerHTML = '';
                         return;
                     }
                     setU = parseSet(uString);
                 }

                switch (operation) {
                    case 'union':
                        result = new Set([...setA, ...setB]);
                        break;
                    case 'intersection':
                        result = new Set([...setA].filter(x => setB.has(x)));
                        break;
                    case 'difference-ab':
                        result = new Set([...setA].filter(x => !setB.has(x)));
                        break;
                    case 'difference-ba':
                        result = new Set([...setB].filter(x => !setA.has(x)));
                        break;
                    case 'complement-a':
                         if (![...setA].every(item => setU.has(item))) {
                             throw new Error("Set A contains elements not in the Universal Set.");
                         }
                        result = new Set([...setU].filter(x => !setA.has(x)));
                        break;
                    case 'complement-b':
                         if (![...setB].every(item => setU.has(item))) {
                             throw new Error("Set B contains elements not in the Universal Set.");
                         }
                        result = new Set([...setU].filter(x => !setB.has(x)));
                        break;
                    default:
                        error = 'Unknown operation';
                }

                 if (operation !== 'union' && operation !== 'intersection' && operation !== 'difference-ab' && operation !== 'difference-ba') {
                      // For complements, also validate if A and B are subsets of U
                      if (operation.includes('complement-a') && ![...setA].every(item => setU.has(item))) {
                          error = "Set A must be a subset of the Universal Set (U).";
                      }
                      if (operation.includes('complement-b') && ![...setB].every(item => setU.has(item))) {
                          error = "Set B must be a subset of the Universal Set (U).";
                      }
                 }


            } catch (e) {
                error = 'Input Error: ' + e.message;
            }

            if (error) {
                setResultsOutput.innerHTML = formatCodeBlock(`Error: ${error}`);
                if (error.includes('Universal Set')) displayError('set-u', error);
                 else if (error.includes('Set must be enclosed')) {
                     if (aString && (!aString.startsWith('{') || !aString.endsWith('}'))) displayError('set-a', error);
                     if (bString && (!bString.startsWith('{') || !bString.endsWith('}'))) displayError('set-b', error);
                      if (uString && (!uString.startsWith('{') || !uString.endsWith('}'))) displayError('set-u', error);
                 } else {
                     // General error, maybe related to element types or parsing
                     if(aString) displayError('set-a', "Parsing error or elements not valid.");
                     if(bString) displayError('set-b', "Parsing error or elements not valid.");
                      if(uString) displayError('set-u', "Parsing error or elements not valid.");
                 }

            } else {
                 displaySuccess('set-a', 'Sets parsed.');
                 displaySuccess('set-b', 'Sets parsed.');
                 if (operation.includes('complement')) displaySuccess('set-u', 'Universal Set parsed.');

                const resultArray = setToArray(result);
                const outputString = `{ ${resultArray.join(', ')} }`;
                setResultsOutput.innerHTML = formatCodeBlock(outputString);
            }
        });
    });

    // --- Predicate Logic ---
    const predicateStatementInput = document.getElementById('predicate-statement');
    const predicateDomainInput = document.getElementById('predicate-domain');
    const evaluatePredicateButton = document.getElementById('evaluate-predicate');
    const predicateResultOutput = document.getElementById('predicate-result');

    // Built-in predicate evaluators
    const predicateEvaluators = {
        'EVEN': (x) => typeof x === 'number' && x % 2 === 0,
        'ODD': (x) => typeof x === 'number' && x % 2 !== 0,
        'PRIME': (x) => {
            if (typeof x !== 'number' || !Number.isInteger(x) || x < 2) return false;
            for (let i = 2, sqrt = Math.sqrt(x); i <= sqrt; i++) {
                if (x % i === 0) return false;
            }
            return true;
        },
        'DIVISIBLE_BY': (x, y) => typeof x === 'number' && typeof y === 'number' && y !== 0 && x % y === 0,
        '>': (x, y) => typeof x === 'number' && typeof y === 'number' && x > y,
        '<': (x, y) => typeof x === 'number' && typeof y === 'number' && x < y,
        '=': (x, y) => x === y, // Strict equality allows different types
        '>=': (x, y) => typeof x === 'number' && typeof y === 'number' && x >= y,
        '<=': (x, y) => typeof x === 'number' && typeof y === 'number' && x <= y,
        // Add more common predicates as needed
    };


    // Basic validation for predicate inputs
     predicateStatementInput.addEventListener('input', () => {
        const value = predicateStatementInput.value.trim().toUpperCase();
         if (value && !/^(FOR ALL|EXISTS).*/.test(value) && !/^[A-Z(>!=<)]+.*$/.test(value)) {
             // Very basic check: must start with quantifier or a predicate-like word/symbol
            displayError('predicate-statement', 'Must start with a quantifier (FOR ALL, EXISTS) or a predicate.');
        } else {
            clearFeedback('predicate-statement');
        }
     });

    predicateDomainInput.addEventListener('input', () => {
         const value = predicateDomainInput.value.trim();
         if (value && !/^{.*}$/.test(value)) {
             displayError('predicate-domain', 'Domain must be a set enclosed in curly braces {}.');
         } else {
             clearFeedback('predicate-domain');
         }
    });


    evaluatePredicateButton.addEventListener('click', () => {
        const statementString = predicateStatementInput.value.trim();
        const domainString = predicateDomainInput.value.trim();
        let result = '';
        let error = '';

        clearFeedback('predicate-statement');
        clearFeedback('predicate-domain');
        predicateResultOutput.innerHTML = '';

        if (!statementString) {
            displayError('predicate-statement', 'Please enter a predicate statement.');
            return;
        }
        if (!domainString) {
             displayError('predicate-domain', 'Please enter a domain set.');
             return;
         }

        try {
            const domain = setToArray(parseSet(domainString)); // Get domain as array

            // Simple parsing of the statement
            const upperStatement = statementString.toUpperCase();
            let quantifier = null;
            let variable = null;
            let predicateExpression = upperStatement;

            const forAllMatch = upperStatement.match(/^FOR ALL\s+([A-Z])\s*,?\s*(.*)$/);
            const existsMatch = upperStatement.match(/^EXISTS\s+([A-Z])\s*,?\s*(.*)$/);

            if (forAllMatch) {
                quantifier = 'FOR ALL';
                variable = forAllMatch[1];
                predicateExpression = forAllMatch[2].trim();
            } else if (existsMatch) {
                quantifier = 'EXISTS';
                variable = existsMatch[1];
                predicateExpression = existsMatch[2].trim();
            } else {
                 throw new Error("Statement must start with 'FOR ALL [variable],' or 'EXISTS [variable],'");
            }

             if (!predicateExpression) {
                  throw new Error("Predicate expression is missing.");
             }


            // Evaluation logic
            let allTrue = true;
            let existsTrue = false;
            let evaluationLog = []; // To show steps

            if (domain.length === 0) {
                evaluationLog.push("Domain is empty.");
                if (quantifier === 'FOR ALL') {
                     // Universal quantification over an empty domain is true
                    allTrue = true;
                } else { // EXISTS
                     // Existential quantification over an empty domain is false
                    existsTrue = false;
                }
            } else {
                for (const element of domain) {
                     // Substitute the current domain element into the predicate expression
                     // This substitution logic is also simplified.
                     // It replaces the variable token in the expression with the literal element value or placeholder.
                     // A more robust parser would evaluate the AST with the substituted value.

                     // Let's try evaluating the simplified logic tokens for each element
                     // Need to convert predicateExpression to evaluable tokens similar to propositional logic

                     // Replace predicate calls like PRED(x, y) with placeholder like _PRED_x_y_
                     let currentElementExpression = predicateExpression;
                     let tempTokens = currentElementExpression.toUpperCase()
                        .replace(/\(/g, ' ( ')
                        .replace(/\)/g, ' ) ')
                        .replace(/NOT|!|~/g, ' NOT ')
                        .replace(/AND|&/g, ' AND ')
                        .replace(/OR|\|/g, ' OR ')
                        .replace(/IF THEN|->/g, ' IFTHEN ')
                        .replace(/IFF|<-?>|<=>/g, ' IFF ')
                        .split(/\s+/)
                        .filter(token => token !== '');


                    // Now, evaluate this expression. When we hit a predicate token like EVEN(x),
                    // we need to call the corresponding predicateEvaluator function.
                    // This requires a modified evaluateLogic or a separate evaluator for predicate tokens.

                     // Let's modify evaluateLogic to handle predicate calls.
                    function evaluatePredicateInstance(tokens, variableValue) {
                        // This is another highly simplified recursive evaluator.
                        // It will look for known predicate names followed by parentheses.
                        // Precedence is still NOT > AND > OR > IFTHEN > IFF > Predicate evaluation (conceptually)

                         // Helper to find closing parenthesis for a given opening one
                        function findClosingParen(startIdx) {
                            let balance = 1;
                            for (let i = startIdx + 1; i < tokens.length; i++) {
                                if (tokens[i] === '(') balance++;
                                if (tokens[i] === ')') balance--;
                                if (balance === 0) return i;
                            }
                            return -1; // Error: No closing parenthesis
                        }

                         let currentTokens = [...tokens]; // Work on a copy

                         // Step 1: Evaluate innermost parentheses first (recursive step)
                        while (currentTokens.includes('(')) {
                            let openIdx = currentTokens.lastIndexOf('('); // Start from the last '(' to handle innermost first
                            let closeIdx = findClosingParen(openIdx);

                            if (closeIdx === -1) throw new Error("Mismatched parentheses in predicate expression.");

                            const subExpressionTokens = currentTokens.slice(openIdx + 1, closeIdx);
                            const subResult = evaluatePredicateInstance(subExpressionTokens, variableValue); // Recursive call

                            // Replace the entire parenthesized sub-expression with its boolean result
                            currentTokens.splice(openIdx, closeIdx - openIdx + 1, subResult ? 'TRUE' : 'FALSE');
                        }

                        // Step 2: Evaluate Predicate calls - this must happen *after* parentheses are resolved
                        // Looks for PREDICATE(args) pattern
                         let i = 0;
                         while (i < currentTokens.length) {
                            const token = currentTokens[i];
                            // Check if token is a known predicate name and is followed by '('
                             if (predicateEvaluators[token] && currentTokens[i+1] === '(') {
                                 const openIdx = i + 1;
                                 const closeIdx = findClosingParen(openIdx); // Find closing paren for the predicate args

                                  if (closeIdx === -1) throw new Error(`Mismatched parentheses in arguments for predicate "${token}".`);

                                  const argsTokens = currentTokens.slice(openIdx + 1, closeIdx);
                                   // Simple argument parsing: comma-separated.
                                   // This needs refinement for complex args or nested predicates.
                                   // For now, assume args are variables or literals.
                                   const args = [];
                                   let currentArg = [];
                                   argsTokens.forEach((argToken, idx) => {
                                       if (argToken === ',') {
                                            if (currentArg.length === 0) throw new Error(`Missing argument before comma in ${token} call.`);
                                            args.push(currentArg.join('')); // Join tokens for multi-char args if needed
                                            currentArg = [];
                                       } else {
                                           currentArg.push(argToken);
                                       }
                                   });
                                   if (currentArg.length > 0) args.push(currentArg.join('')); // Add last argument


                                   // Resolve arguments: if it's the quantified variable, use variableValue
                                   // If it's another variable (not supported in this simple model), or a literal.
                                   // For this demo, arguments can only be the quantified variable OR literal numbers/strings.
                                   const resolvedArgs = args.map(arg => {
                                        if (arg === variable) return variableValue;
                                        // Try to parse as number
                                        if (!isNaN(arg) && arg !== '') return parseFloat(arg);
                                         // Handle simple quoted strings
                                         if (arg.startsWith('"') && arg.endsWith('"')) return arg.substring(1, arg.length - 1);
                                         if (arg.startsWith("'") && arg.endsWith("'")) return arg.substring(1, arg.length - 1);

                                        // If it's none of the above, treat as literal string or unsupported type
                                         // console.warn(`Predicate argument "${arg}" treated as literal string.`);
                                        return arg; // Treat as literal string
                                   });


                                  // Call the predicate evaluator
                                  const predicateResult = predicateEvaluators[token](...resolvedArgs);
                                   if (typeof predicateResult !== 'boolean') {
                                        throw new Error(`Predicate "${token}" did not return a boolean result.`);
                                   }

                                  // Replace the predicate call PRED(...) with its boolean result
                                   currentTokens.splice(i, closeIdx - i + 1, predicateResult ? 'TRUE' : 'FALSE');
                                   // Do NOT increment i, as we want to re-evaluate at the current position in case of chained calls (though unlikely)
                                   continue; // Continue the while loop check from the start
                             }
                             i++; // Move to the next token
                         }

                        // Step 3: Replace remaining tokens with TRUE/FALSE (shouldn't be variables here after predicate evaluation)
                         // (This step might be redundant if step 2 handles all non-boolean tokens correctly)

                        // Step 4: Evaluate logical operators based on precedence (NOT, AND, OR, IFTHEN, IFF) - Same logic as evaluateLogic
                        // (Copy/paste the logic from evaluateLogic - needs refactoring into a shared function)

                        // --- Logical Operator Evaluation (Copied from evaluateLogic - needs unification) ---
                         // Perform NOT operations
                         while(currentTokens.includes('NOT')) {
                            const notIdx = currentTokens.indexOf('NOT');
                            const nextToken = currentTokens[notIdx + 1];
                            if (nextToken === 'TRUE') {
                                currentTokens.splice(notIdx, 2, 'FALSE');
                            } else if (nextToken === 'FALSE') {
                                currentTokens.splice(notIdx, 2, 'TRUE');
                            } else {
                                throw new Error("Invalid NOT operation syntax in predicate instance.");
                            }
                         }

                          // Perform AND operations
                          while(currentTokens.includes('AND')) {
                              const andIdx = currentTokens.indexOf('AND');
                              const left = currentTokens[andIdx - 1];
                              const right = currentTokens[andIdx + 1];

                              if (left === 'TRUE' || left === 'FALSE' && right === 'TRUE' || right === 'FALSE') {
                                   const result = (left === 'TRUE') && (right === 'TRUE');
                                   currentTokens.splice(andIdx - 1, 3, result ? 'TRUE' : 'FALSE');
                              } else {
                                   throw new Error("Invalid AND operation syntax in predicate instance.");
                              }
                          }

                           // Perform OR operations
                           while(currentTokens.includes('OR')) {
                               const orIdx = currentTokens.indexOf('OR');
                               const left = currentTokens[orIdx - 1];
                               const right = currentTokens[orIdx + 1];

                               if (left === 'TRUE' || left === 'FALSE' && right === 'TRUE' || right === 'FALSE') {
                                   const result = (left === 'TRUE') || (right === 'FALSE'); // ERROR: Should be || (right == 'TRUE')
                                    currentTokens.splice(orIdx - 1, 3, result ? 'TRUE' : 'FALSE');
                               } else {
                                   throw new Error("Invalid OR operation syntax in predicate instance.");
                               }
                           }

                            // Perform IFTHEN operations (p -> q is !p || q)
                            while(currentTokens.includes('IFTHEN')) {
                                const ifthenIdx = currentTokens.indexOf('IFTHEN');
                                const antecedent = currentTokens[ifthenIdx - 1];
                                const consequent = currentTokens[ifthenIdx + 1];

                                if (antecedent === 'TRUE' || antecedent === 'FALSE' && consequent === 'TRUE' || consequent === 'FALSE') {
                                    const result = (antecedent === 'FALSE') || (consequent === 'TRUE');
                                    currentTokens.splice(ifthenIdx - 1, 3, result ? 'TRUE' : 'FALSE');
                                } else {
                                    throw new Error("Invalid IF THEN operation syntax in predicate instance.");
                                }
                            }

                           // Perform IFF operations (p <-> q is (p AND q) OR (NOT p AND NOT q))
                           while(currentTokens.includes('IFF')) {
                               const iffIdx = currentTokens.indexOf('IFF');
                               const left = currentTokens[iffIdx - 1];
                               const right = currentTokens[iffIdx + 1];

                                if (left === 'TRUE' || left === 'FALSE' && right === 'TRUE' || right === 'FALSE') {
                                    const result = (left === 'TRUE' && right === 'TRUE') || (left === 'FALSE' && right === 'FALSE');
                                    currentTokens.splice(iffIdx - 1, 3, result ? 'TRUE' : 'FALSE');
                                } else {
                                    throw new Error("Invalid IFF operation syntax in predicate instance.");
                                }
                           }
                        // --- End Copied Logic ---


                        // After all operations, there should be a single boolean token left
                        if (currentTokens.length !== 1 || (currentTokens[0] !== 'TRUE' && currentTokens[0] !== 'FALSE')) {
                           throw new Error(`Evaluation failed for element ${variableValue}. Resulting tokens: ${currentTokens.join(' ')}`);
                        }

                        return currentTokens[0] === 'TRUE';
                    }


                    // Evaluate the predicate expression for the current domain element
                    let elementResult = false;
                    let instanceError = null;
                    try {
                         // Need to parse predicateExpression into tokens first
                         const predicateTokens = predicateExpression.toUpperCase()
                             .replace(/\(/g, ' ( ')
                             .replace(/\)/g, ' ) ')
                             .replace(/NOT|!|~/g, ' NOT ')
                             .replace(/AND|&/g, ' AND ')
                             .replace(/OR|\|/g, ' OR ')
                             .replace(/IF THEN|->/g, ' IFTHEN ')
                             .replace(/IFF|<-?>|<=>/g, ' IFF ')
                             .split(/\s+/)
                             .filter(token => token !== '');

                         elementResult = evaluatePredicateInstance(predicateTokens, element); // Evaluate for the current element
                         evaluationLog.push(`For ${variable} = ${element}: ${elementResult ? 'True' : 'False'}`);
                    } catch (e) {
                         instanceError = e.message;
                         evaluationLog.push(`For ${variable} = ${element}: ERROR - ${e.message}`);
                         // If any evaluation for an element fails, the whole statement might be invalid or indeterminate
                         throw new Error(`Evaluation failed for element ${element}: ${e.message}`);
                    }


                    if (quantifier === 'FOR ALL') {
                        if (!elementResult) {
                            allTrue = false; // Found a counterexample
                            break; // No need to check further
                        }
                    } else { // EXISTS
                        if (elementResult) {
                            existsTrue = true; // Found an example
                            break; // No need to check further
                        }
                    }
                } // End domain loop
            } // End else (non-empty domain)


            // Final Result based on quantifier
            let finalResult = false;
            if (quantifier === 'FOR ALL') {
                 finalResult = allTrue;
                 result = `Statement "${statementString}" is ${finalResult ? 'TRUE' : 'FALSE'}. (FOR ALL requires true for all elements)`;
            } else { // EXISTS
                 finalResult = existsTrue;
                 result = `Statement "${statementString}" is ${finalResult ? 'TRUE' : 'FALSE'}. (EXISTS requires true for at least one element)`;
            }
             result += "\n\n--- Evaluation Log ---\n" + evaluationLog.join('\n');


        } catch (e) {
            error = 'Evaluation Error: ' + e.message;
             // Try to give specific feedback based on error source
            if(e.message.includes('Statement must start with')) {
                displayError('predicate-statement', e.message);
            } else if (e.message.includes('Domain must be a set')) {
                 displayError('predicate-domain', e.message);
            } else {
                // General parsing or evaluation error
                displayError('predicate-statement', error);
            }
        }

         if (error) {
             predicateResultOutput.innerHTML = formatCodeBlock(`Error: ${error}`);
         } else {
             predicateResultOutput.innerHTML = formatCodeBlock(result);
         }
    });


     // --- Relations ---
    const relationSetInput = document.getElementById('relation-set');
    const relationPairsInput = document.getElementById('relation-pairs');
    const checkRelationButton = document.getElementById('check-relation');
    const visualizeRelationButton = document.getElementById('visualize-relation');
    const relationPropertiesOutput = document.getElementById('relation-properties');
    const relationGraphArea = document.getElementById('relation-graph');

    // Basic validation for relation inputs
     relationSetInput.addEventListener('input', () => {
        const value = relationSetInput.value.trim();
         if (value && !/^{.*}$/.test(value)) {
             displayError('relation-set', 'Set must be enclosed in curly braces {}.');
         } else {
             clearFeedback('relation-set');
         }
     });

    relationPairsInput.addEventListener('input', () => {
         const value = relationPairsInput.value.trim();
          // Simple check: must be { ... } and contain (a,b) pairs
         if (value && !/^{.*}$/.test(value)) {
              displayError('relation-pairs', 'Relation must be a set enclosed in curly braces {}.');
          } else if (value && value !== '{}' && !/\(\s*[^,\s]+\s*,\s*[^,\s]+\s*\)/.test(value)) {
               displayError('relation-pairs', 'Relation set must contain ordered pairs like (a, b).');
          }
          else {
              clearFeedback('relation-pairs');
          }
     });


     function parseRelation(relationString, setElementsArray) {
         const trimmed = relationString.trim();
         if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
             throw new Error("Relation must be enclosed in curly braces {}.");
         }
         const content = trimmed.substring(1, trimmed.length - 1).trim();
          if (content === '') return []; // Handle empty relation {}

         const pairs = [];
         // Regex to find pairs like (a,b) - needs careful handling of nested commas if elements can have commas
         // Assuming simple elements without commas for now
         const pairRegex = /\(\s*([^,\s)]+)\s*,\s*([^,\s)]+)\s*\)/g;
         let match;
         let lastIndex = 0;
         const pairsFound = [];

         while ((match = pairRegex.exec(content)) !== null) {
             // Check if there's non-whitespace content between matches (invalid syntax)
             const textBetween = content.substring(lastIndex, match.index).trim();
             if (textBetween !== '' && textBetween !== ',') {
                  throw new Error(`Invalid content "${textBetween}" found between relation pairs.`);
             }
             if (lastIndex > 0 && textBetween === '') { // Missing comma between pairs?
                  // This check might be too strict depending on desired input flexibility
             }


             const element1 = match[1].trim();
             const element2 = match[2].trim();

              // Attempt to parse elements like parseSet
              const parseElement = (item) => {
                  if (!isNaN(item) && item !== '') return parseFloat(item);
                   if (item.startsWith('"') && item.endsWith('"')) return item.substring(1, item.length - 1);
                   if (item.startsWith("'") && item.endsWith("'")) return item.substring(1, item.length - 1);
                  return item;
              };

             const parsedElement1 = parseElement(element1);
             const parsedElement2 = parseElement(element2);

              // Validate that elements in pairs are present in the set A
             const setHasElement = (setArray, element) => setArray.some(item => {
                  // Need robust comparison for different types (numbers, strings, etc.)
                  // Simple strict equality might not work for 5 vs "5" if desired
                  // For now, use strict equality which matches parseSet's output
                  return item === element;
             });

             if (!setHasElement(setElementsArray, parsedElement1)) {
                  throw new Error(`Element "${element1}" from pair (${element1},${element2}) is not in Set A.`);
             }
              if (!setHasElement(setElementsArray, parsedElement2)) {
                  throw new Error(`Element "${element2}" from pair (${element1},${element2}) is not in Set A.`);
              }


             pairs.push([parsedElement1, parsedElement2]);
             pairsFound.push(match[0]); // Keep track of found pairs
             lastIndex = pairRegex.lastIndex;
         }

          // Final check: Ensure all non-whitespace content in the trimmed string is accounted for by pairsFound
         // This is tricky if commas are optional between pairs like {(a,b)(c,d)} vs {(a,b),(c,d)}
         // Assuming {(a,b),(c,d)} format requires commas for robust parsing
          const expectedContent = pairsFound.join(', ').trim();
          const actualContent = content.replace(/\s+/g, '').replace(/,\s*/g,',').trim(); // Normalize whitespace and commas
          const normalizedPairsFound = pairsFound.map(p => p.replace(/\s+/g, '')); // Normalize found pairs
           const normalizedActualContent = content.replace(/\s+/g, '').replace(/,\s*/g,',').trim();

           // This check is still prone to errors. A robust parser is needed for full flexibility.
           // Let's simplify the check: just ensure it starts and ends with {} and contains () pairs separated by commas.
           // The regex check at the input handler level is more practical for this demo.

         return pairs;
     }


    checkRelationButton.addEventListener('click', () => {
         const setString = relationSetInput.value.trim();
         const pairsString = relationPairsInput.value.trim();
         let properties = '';
         let error = '';

         clearFeedback('relation-set');
         clearFeedback('relation-pairs');
         relationPropertiesOutput.innerHTML = '';

          if (!setString) {
             displayError('relation-set', 'Please enter Set A.');
             return;
         }
          if (!pairsString) {
             displayError('relation-pairs', 'Please enter Relation R as a set of pairs.');
             return;
         }


         try {
             const setA = setToArray(parseSet(setString)); // Get set as array for easier iteration
             const relationPairs = parseRelation(pairsString, setA);

             displaySuccess('relation-set', 'Set A parsed.');
             displaySuccess('relation-pairs', 'Relation R parsed and validated against Set A.');


             // Check Properties
             const isReflexive = setA.every(x => relationPairs.some(pair => pair[0] === x && pair[1] === x));
             const isSymmetric = relationPairs.every(pair => relationPairs.some(p => p[0] === pair[1] && p[1] === pair[0]));
             const isAntisymmetric = relationPairs.every(pair1 =>
                 !(pair1[0] !== pair1[1] && relationPairs.some(pair2 => pair2[0] === pair1[1] && pair2[1] === pair1[0]))
             );
              // Check Transitivity: For every (a,b) and (b,c) in R, (a,c) must be in R
            const isTransitive = relationPairs.every(pair1 => { // pair1 is (a,b)
                return relationPairs.filter(pair2 => pair2[0] === pair1[1]) // find pairs (b,c)
                                    .every(pair2 => { // for each (b,c)
                                        const a = pair1[0];
                                        const c = pair2[1];
                                        return relationPairs.some(pair3 => pair3[0] === a && pair3[1] === c); // check if (a,c) is in R
                                    });
            });


             properties = `Reflexive: ${isReflexive ? 'Yes' : 'No'}\n`;
             properties += `Symmetric: ${isSymmetric ? 'Yes' : 'No'}\n`;
             properties += `Antisymmetric: ${isAntisymmetric ? 'Yes' : 'No'}\n`;
             properties += `Transitive: ${isTransitive ? 'Yes' : 'No'}`;


         } catch (e) {
              error = 'Input or Processing Error: ' + e.message;
               if(e.message.includes('Set must be enclosed')) {
                   displayError('relation-set', e.message);
               } else if (e.message.includes('Relation must be a set')) {
                  displayError('relation-pairs', e.message);
               } else if (e.message.includes('Element "') && e.message.includes('" is not in Set A.')) {
                   displayError('relation-pairs', e.message);
               }
               else {
                    // General parsing or logic error
                    displayError('relation-pairs', error); // Or relation-set depending on source
               }
         }

          if (error) {
              relationPropertiesOutput.innerHTML = formatCodeBlock(`Error: ${error}`);
          } else {
              relationPropertiesOutput.innerHTML = formatCodeBlock(properties);
          }
    });


     visualizeRelationButton.addEventListener('click', () => {
         const setString = relationSetInput.value.trim();
         const pairsString = relationPairsInput.value.trim();
         relationGraphArea.innerHTML = ''; // Clear previous graph
         let error = '';

         clearFeedback('relation-set');
         clearFeedback('relation-pairs');


          if (!setString) {
             displayError('relation-set', 'Please enter Set A to visualize.');
             return;
         }
          if (!pairsString) {
             displayError('relation-pairs', 'Please enter Relation R to visualize.');
             return;
         }


         try {
              const setA = setToArray(parseSet(setString));
              const relationPairs = parseRelation(pairsString, setA);

               if (setA.length > 10) { // Limit nodes for visualization performance/layout
                  throw new Error(`Too many elements in Set A (${setA.length}). Max is 10 for visualization.`);
               }

              // --- Graph Visualization Logic (using SVG) ---
             const width = relationGraphArea.clientWidth;
             const height = relationGraphArea.clientHeight;
             const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
             svg.setAttribute('width', '100%');
             svg.setAttribute('height', '100%');
             svg.setAttribute('viewBox', `0 0 ${width} ${height}`); // Scale SVG content
             svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

             // Define arrowhead marker
             const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
             const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
             marker.setAttribute('id', 'arrowhead');
             marker.setAttribute('markerWidth', '10');
             marker.setAttribute('markerHeight', '7');
             marker.setAttribute('refX', '9'); // Position the tip of the arrow
             marker.setAttribute('refY', '3.5');
             marker.setAttribute('orient', 'auto');
             const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
             polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
             marker.appendChild(polygon);
             defs.appendChild(marker);
             svg.appendChild(defs);


             // Calculate node positions (simple circular layout)
             const centerX = width / 2;
             const centerY = height / 2;
             const radius = Math.min(width, height) / 2 * 0.8; // Use 80% of the smaller dimension
             const positions = {};
             setA.forEach((element, index) => {
                 const angle = (index / setA.length) * 2 * Math.PI;
                 const x = centerX + radius * Math.cos(angle);
                 const y = centerY + radius * Math.sin(angle);
                 positions[element] = { x, y };

                 // Draw nodes
                 const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                 nodeGroup.classList.add('node');
                 nodeGroup.setAttribute('transform', `translate(${x}, ${y})`);

                 const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                 circle.setAttribute('r', '20'); // Node radius
                 nodeGroup.appendChild(circle);

                 const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                 text.textContent = element;
                 nodeGroup.appendChild(text);

                 svg.appendChild(nodeGroup);
             });

            // Draw edges (arrows)
            relationPairs.forEach(pair => {
                 const startElement = pair[0];
                 const endElement = pair[1];
                 const p1 = positions[startElement];
                 const p2 = positions[endElement];

                if (!p1 || !p2) return; // Should not happen if parseRelation validates

                 let line;

                if (startElement === endElement) {
                     // Self-loop edge
                     line = document.createElementNS("http://www.w3.org/2000/svg", "path");
                     // Create a small arc for the loop
                     const loopRadius = 25; // Radius of the loop arc
                     const angleOffset = 30 * Math.PI / 180; // Offset angle for positioning the loop
                     const angle = Math.atan2(p1.y - centerY, p1.x - centerX); // Angle from center to node
                     const loopX = p1.x + loopRadius * Math.cos(angle + angleOffset);
                     const loopY = p1.y + loopRadius * Math.sin(angle + angleOffset);

                     const arcX = p1.x + loopRadius * Math.cos(angle + angleOffset * 2); // Slightly further point
                     const arcY = p1.y + loopRadius * Math.sin(angle + angleOffset * 2);

                     const pathData = `M ${p1.x-20} ${p1.y} A ${loopRadius},${loopRadius} 0 1,0 ${p1.x+20},${p1.y} A ${loopRadius},${loopRadius} 0 1,0 ${p1.x-20},${p1.y}`;

                     // Simple loop path (adjust coordinates based on node size and position)
                     // This is a basic representation; proper self-loop drawing needs careful geometry
                     // Let's draw a small curve near the node
                      const r = 20; // node radius
                      const dx = Math.cos(angle + Math.PI/2) * (r); // Offset perpendicular to center-node line
                      const dy = Math.sin(angle + Math.PI/2) * (r);

                      const startX = p1.x + dx;
                      const startY = p1.y + dy;
                      const endX = p1.x - dx;
                      const endY = p1.y - dy;

                       // Control points for a curve (adjust as needed)
                       const cp1x = p1.x + dx * 2 + Math.cos(angle) * 20;
                       const cp1y = p1.y + dy * 2 + Math.sin(angle) * 20;
                       const cp2x = p1.x - dx * 2 + Math.cos(angle) * 20;
                       const cp2y = p1.y - dy * 2 + Math.sin(angle) * 20;


                      const loopPath = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
                       line.setAttribute('d', loopPath);
                       line.setAttribute('fill', 'none');

                 } else {
                      // Standard directed edge
                      line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                      // Adjust start and end points to be on the circle circumference, not center
                      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                      const r = 20; // Node radius
                      const startX = p1.x + r * Math.cos(angle);
                      const startY = p1.y + r * Math.sin(angle);
                      // Adjust end point slightly back from circle center to avoid arrow tip overlapping node
                      const endX = p2.x - r * Math.cos(angle);
                      const endY = p2.y - r * Math.sin(angle);


                      line.setAttribute('x1', startX);
                      line.setAttribute('y1', startY);
                      line.setAttribute('x2', endX);
                      line.setAttribute('y2', endY);
                      line.setAttribute('marker-end', 'url(#arrowhead)'); // Add arrowhead
                 }


                 line.classList.add('edge');
                 svg.appendChild(line);
            });

             relationGraphArea.appendChild(svg);
             displaySuccess('relation-set', 'Set A parsed.'); // Re-affirm success after potential graph error
             displaySuccess('relation-pairs', 'Relation R parsed and visualized.'); // Re-affirm success

         } catch (e) {
              error = 'Visualization Error: ' + e.message;
               if(e.message.includes('Set must be enclosed')) {
                   displayError('relation-set', e.message);
               } else if (e.message.includes('Relation must be a set')) {
                  displayError('relation-pairs', e.message);
               } else if (e.message.includes('Element "') && e.message.includes('" is not in Set A.')) {
                   displayError('relation-pairs', e.message);
               } else if (e.message.includes('Too many elements')) {
                    displayError('relation-set', e.message);
               }
               else {
                    // General parsing or logic error
                    displayError('relation-pairs', error); // Or relation-set depending on source
               }
              relationGraphArea.innerHTML = formatCodeBlock(`Error: ${error}`); // Display error in graph area
         }
     });


    // --- Modal (Help/Documentation) ---
    const modal = document.getElementById("helpModal");
    const openHelpBtn = document.getElementById("openHelp");
    const closeBtn = modal.querySelector(".close-button");

    openHelpBtn.onclick = function() {
      modal.style.display = "block";
    }

    closeBtn.onclick = function() {
      modal.style.display = "none";
    }

    // Close modal when clicking outside of it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    // --- Collapsible Docs ---
    const coll = document.querySelectorAll(".collapsible");
    coll.forEach(item => {
        item.addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.style.maxHeight){
              content.style.maxHeight = null;
            } else {
              content.style.maxHeight = content.scrollHeight + "px"; // Adjust height based on content
            }
        });
    });

     // Initialize tab state
     document.querySelector('.tab-button.active').click(); // Trigger click on default active tab
});
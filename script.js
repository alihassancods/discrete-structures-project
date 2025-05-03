const buttons = document.querySelectorAll('.section-btn');
const sectionData = {
"prop-logic-title" : `<h2 id="prop-logic-title">Propositional Logic - Truth Tables</h2>
    <label for="prop-expression">Enter logical expression:</label>
    <input type="text" id="prop-expression" placeholder="e.g. (p && q) || !r" aria-describedby="prop-logic-note" />
    <div class="small-note" id="prop-logic-note">Use variables like p, q, r with && (AND), || (OR), ! (NOT), and parentheses.</div>
    <button id="generate-truth-table-btn">Generate Truth Table</button>
    <pre class="result-box" id="truth-table-result" aria-live="polite" aria-atomic="true"></pre>`,
"set-ops-title" : `<h2 id="set-ops-title">Set Operations</h2>
    <label for="set-A">Set A (comma separated):</label>
    <input type="text" id="set-A" placeholder="e.g. 1,2,3,4" />
    <label for="set-B">Set B (comma separated):</label>
    <input type="text" id="set-B" placeholder="e.g. 3,4,5,6" />
    <button id="perform-set-ops-btn">Perform Set Operations</button>
    <pre class="result-box" id="set-ops-result" aria-live="polite" aria-atomic="true"></pre>`,
"pred-logic-title" : `<h2 id="pred-logic-title">Predicate Logic Validation</h2>
    <label for="predicate-domain">Domain (comma separated numbers):</label>
    <input type="text" id="predicate-domain" placeholder="e.g. 2,4,6,8" />
    <label for="predicate-expression">Predicate Expression (use 'x'):</label>
    <input type="text" id="predicate-expression" placeholder="e.g. x % 2 === 0" aria-describedby="predicate-note" />
    <div class="small-note" id="predicate-note">JS expression with variable x, returning true/false. Example: x % 2 === 0</div>
    <button id="validate-predicate-btn">Validate Predicate</button>
    <pre class="result-box" id="predicate-result" aria-live="polite" aria-atomic="true"></pre>`,   
"relations-title" : `<h2 id="relations-title">Relations - Properties Check</h2>
    <label for="relation-set-A">Set A (comma separated):</label>
    <input type="text" id="relation-set-A" placeholder="e.g. 1,2,3" />
    <label for="relation-R">Relation R (pairs as (a,b), comma separated):</label>
    <input type="text" id="relation-R" placeholder="e.g. (1,1),(2,2),(3,3),(1,2)" />
    <button id="check-relation-btn">Check Relation Properties</button>
    <pre class="result-box" id="relation-result" aria-live="polite" aria-atomic="true"></pre>`,
};

buttons.forEach(button => {
    button.addEventListener('click', () => {    
        const activeButton = document.querySelector('.active');
        if( button.classList.contains('active')){} // Already active
        else {
            activeButton.classList.remove('active');
            button.classList.add('active');
        }
        const contentSection = document.querySelector('.content');
        contentSection.attributes['aria-labelledby'].value = button.attributes['data-target'].value;
        contentSection.innerHTML = sectionData[button.attributes['data-target'].value];
    });
});

// Utilities
function parseSet(str) {
    return new Set(str.split(',').map(s => s.trim()).filter(s => s !== '').map(s => isNaN(s) ? s : Number(s)));
  }

  function parseRelation(str) {
    // Format: (a,b),(c,d)
    const pairs = [];
    const regex = /\(([^,]+),([^()]+)\)/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      let a = match[1].trim();
      let b = match[2].trim();
      a = isNaN(a) ? a : Number(a);
      b = isNaN(b) ? b : Number(b);
      pairs.push([a,b]);
    }
    return pairs;
  }

  // Propositional logic truth table ---------------------------------------------------

  function extractVariables(expr) {
    // Variables: letters a-z (single)
    const varSet = new Set();
    for(const char of expr){
      if(/[a-z]/i.test(char)){
        varSet.add(char);
      }
    }
    return Array.from(varSet).sort();
  }

  function evalExpression(expr, env) {
    // Replace variables with their boolean values in env
    let evalStr = expr;
    for(const v in env){
      const val = env[v];
      // Replace all occurrences of variable with true/false string
      const re = new RegExp('\\b'+v+'\\b','g');
      evalStr = evalStr.replace(re, val ? 'true' : 'false');
    }
    try {
      // eslint-disable-next-line no-eval
      return eval(evalStr);
    } catch(e) {
      return null;
    }
  }

  function generateTruthTable(expr) {
    const vars = extractVariables(expr);

    if(vars.length === 0) {
      // No variables: just evaluate once
      const val = evalExpression(expr, {});
      return {
        vars: [],
        rows: [[val]],
        error: val === null ? "Invalid Expression" : null
      };
    }

    const n = vars.length;
    const rows = [];

    for(let i=0; i<(1<<n); i++){
      const env = {};
      for(let j=0; j<n; j++){
        env[vars[j]] = !!(i & (1 << (n-j-1)));
      }
      const res = evalExpression(expr, env);
      if(res === null) return {error:"Invalid Expression"};
      rows.push(vars.map(v => env[v]).concat(res));
    }

    return { vars, rows, error:null };
  }

  // Set operations ---------------------------------------------------
  function toArray(set) {
    return Array.from(set).sort((a,b) => {
      if(typeof a === 'number' && typeof b === 'number') return a - b;
      return a.toString().localeCompare(b.toString());
    });
  }

  function setUnion(A, B) {
    return new Set([...A, ...B]);
  }

  function setIntersection(A, B) {
    return new Set([...A].filter(x => B.has(x)));
  }

  function setDifference(A, B) {
    return new Set([...A].filter(x => !B.has(x)));
  }

  // Predicate logic ---------------------------------------------------
  function evaluatePredicate(domain, expr) {
    // expr is JS expression using variable x
    try {
      for(const x of domain){
        // eslint-disable-next-line no-eval
        const res = eval(expr);
        if(!res) return false;
      }
      return true;
    } catch(e) {
      return null;
    }
  }

  // Relations properties ----------------------------------------------
  function isReflexive(R, A){
    return A.every(a => R.some(pair => pair[0] === a && pair[1] === a));
  }
  function isSymmetric(R){
    return R.every(([a,b]) => R.some(([x,y]) => x === b && y === a));
  }
  function isTransitive(R){
    for(const [a,b] of R){
      for(const [c,d] of R){
        if(b === c){
          if(!R.some(([x,y]) => x === a && y === d)) return false;
        }
      }
    }
    return true;
  }

  // UI event handlers ------------------------------------------------
if (document.getElementById('generate-truth-table-btn')) {
  document.getElementById('generate-truth-table-btn').addEventListener('click', () => {
    const expr = document.getElementById('prop-expression').value.trim();
    const output = document.getElementById('truth-table-result');
    if(!expr){
      output.textContent = 'Please input a logical expression.';
      return;
    }

    // Validate expression characters (only allow letters, !, &, |, ^, parentheses, spaces)
    if(!/^[-!&|()^a-zA-Z\s]+$/.test(expr)){
      output.textContent = 'Invalid characters detected. Use variables (a-z) and these logical operators: && (and), || (or), ! (not), ^ (xor).';
      return;
    }

    const res = generateTruthTable(expr);

    if(res.error){
      output.textContent = "Error: "+res.error;
      return;
    }

    if(res.vars.length === 0){
      output.textContent = 'Expression evaluates to: ' + res.rows[0][0];
      return;
    }

    // Output header
    let tableText = res.vars.join(' | ') + ' | Result\n';
    tableText += '-'.repeat(tableText.length) + '\n';

    for(const row of res.rows){
      tableText += row.map(v => v ? 'T' : 'F').join(' | ') + ' | ' + (row[row.length-1] ? 'T' : 'F') + '\n';
    }

    output.textContent = tableText;
  });
}
else if (document.getElementById('perform-set-ops-btn') != null) {
  document.getElementById('perform-set-ops-btn').addEventListener('click', () => {
    console.log('perform-set-ops-btn found');
    const inputA = document.getElementById('set-A').value.trim();
    const inputB = document.getElementById('set-B').value.trim();
    const output = document.getElementById('set-ops-result');

    if(!inputA || !inputB){
      output.textContent = 'Please input both sets.';
      return;
    }

    const setA = parseSet(inputA);
    const setB = parseSet(inputB);

    const union = toArray(setUnion(setA, setB));
    const intersection = toArray(setIntersection(setA, setB));
    const diffAB = toArray(setDifference(setA, setB));
    const diffBA = toArray(setDifference(setB, setA));

    output.textContent =
      `A = {${toArray(setA).join(', ')}}\nB = {${toArray(setB).join(', ')}}\n\n` +
      `A ∪ B = {${union.join(', ')}}\n` +
      `A ∩ B = {${intersection.join(', ')}}\n` +
      `A - B = {${diffAB.join(', ')}}\n` +
      `B - A = {${diffBA.join(', ')}}\n`;
  });
}
else if (document.getElementById('validate-predicate-btn') != null) {
  document.getElementById('validate-predicate-btn').addEventListener('click', () => {
    const domainStr = document.getElementById('predicate-domain').value.trim();
    const expr = document.getElementById('predicate-expression').value.trim();
    const output = document.getElementById('predicate-result');

    if(!domainStr || !expr){
      output.textContent = 'Please input both domain and predicate expression.';
      return;
    }

    const domain = domainStr.split(',').map(x => Number(x.trim())).filter(x => !isNaN(x));
    if(domain.length === 0){
      output.textContent = 'Invalid domain. Please provide numbers separated by commas.';
      return;
    }

    // Safety: check that expression contains only allowed characters and 'x'
    if(!/^[x0-9\s\%\*\+\-\>\<\=\&\|\!\(\)]+$/.test(expr)){
      output.textContent = 'Predicate expression contains invalid characters. Use variable "x" and JS operators.';
      return;
    }

    try {
      const valid = evaluatePredicate(domain, expr);
      if(valid === null){
        output.textContent = 'Error evaluating predicate expression.';
      } else if (valid === true){
        output.textContent = 'Predicate is TRUE for all elements in the domain.';
      } else {
        output.textContent = 'Predicate is FALSE for some elements in the domain.';
      }
    } catch(e) {
      output.textContent = 'Error evaluating predicate expression.';
    }
  });
}
else if (document.getElementById('check-relation-btn') != null) {
    console.log('check-relation-btn found');
  document.getElementById('check-relation-btn').addEventListener('click', () => {
    const setStr = document.getElementById('relation-set-A').value.trim();
    const relStr = document.getElementById('relation-R').value.trim();
    const output = document.getElementById('relation-result');

    if(!setStr || !relStr){
      output.textContent = 'Please input set A and the relation R.';
      return;
    }

    const setA = setStr.split(',').map(x => x.trim()).filter(x => x !== '').map(x => isNaN(x) ? x : Number(x));
    const relation = parseRelation(relStr);

    if(setA.length === 0 || relation.length === 0){
      output.textContent = 'Invalid input for set or relation.';
      return;
    }

    const reflexive = isReflexive(relation, setA);
    const symmetric = isSymmetric(relation);
    const transitive = isTransitive(relation);

    output.textContent = 
      `Relation properties on set A = {${setA.join(', ')}}:\n` +
      `Reflexive: ${reflexive}\n` +
      `Symmetric: ${symmetric}\n` +
      `Transitive: ${transitive}\n`;
  });
}
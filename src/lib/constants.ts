// Learning domains available for selection
export const LEARNING_DOMAINS = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Master fundamental CS concepts for coding interviews',
    icon: '🧮',
    color: 'primary',
  },
  {
    id: 'webdev',
    name: 'Web Development',
    description: 'Build modern, responsive web applications',
    icon: '🌐',
    color: 'secondary',
  },
  {
    id: 'ai-ml',
    name: 'AI / Machine Learning',
    description: 'Explore intelligent systems and neural networks',
    icon: '🤖',
    color: 'accent',
  },
] as const;

// Static roadmaps for each domain
export const ROADMAPS: Record<string, Array<{ id: string; name: string; description: string }>> = {
  dsa: [
    { id: 'dsa-arrays', name: 'Arrays', description: 'Learn array operations, traversal, and common patterns' },
    { id: 'dsa-linked-lists', name: 'Linked Lists', description: 'Understand singly and doubly linked list implementations' },
    { id: 'dsa-stacks', name: 'Stacks', description: 'LIFO data structure and its applications' },
    { id: 'dsa-queues', name: 'Queues', description: 'FIFO structure, circular queues, and priority queues' },
    { id: 'dsa-trees', name: 'Trees', description: 'Binary trees, BST, traversals, and balancing' },
  ],
  webdev: [
    { id: 'web-html', name: 'HTML Fundamentals', description: 'Semantic markup and document structure' },
    { id: 'web-css', name: 'CSS & Layouts', description: 'Styling, Flexbox, Grid, and responsive design' },
    { id: 'web-js', name: 'JavaScript Essentials', description: 'Core JS concepts, DOM manipulation, events' },
    { id: 'web-react', name: 'React Basics', description: 'Components, state, props, and hooks' },
    { id: 'web-api', name: 'APIs & Async', description: 'REST APIs, fetch, async/await patterns' },
  ],
  'ai-ml': [
    { id: 'ml-intro', name: 'ML Foundations', description: 'Core concepts, types of learning, and workflows' },
    { id: 'ml-regression', name: 'Regression', description: 'Linear and polynomial regression techniques' },
    { id: 'ml-classification', name: 'Classification', description: 'Logistic regression, decision trees, SVM' },
    { id: 'ml-neural', name: 'Neural Networks', description: 'Perceptrons, backpropagation, deep learning intro' },
    { id: 'ml-practical', name: 'Practical ML', description: 'Model evaluation, feature engineering, deployment' },
  ],
};

// Static module content
export const MODULE_CONTENT: Record<string, {
  tldr: string;
  videoUrl?: string;
  textContent: string;
  concepts: string[];
}> = {
  'dsa-arrays': {
    tldr: 'Arrays are contiguous memory blocks storing elements of the same type. O(1) access, O(n) insertion/deletion.',
    textContent: `# Arrays: The Foundation of Data Structures

Arrays are the most fundamental data structure in programming. They store elements in contiguous memory locations, allowing for constant-time access to any element using its index.

## Key Concepts

### Time Complexity
- **Access**: O(1) - Direct index access
- **Search**: O(n) - Linear search, O(log n) with binary search if sorted
- **Insertion**: O(n) - May require shifting elements
- **Deletion**: O(n) - Requires shifting elements

### Common Patterns
1. **Two Pointers**: Use two indices to traverse the array
2. **Sliding Window**: Maintain a subset of elements
3. **Prefix Sum**: Precompute cumulative sums for range queries

### Memory Layout
Arrays allocate memory as: base_address + (index × element_size)`,
    concepts: ['Array Indexing', 'Time Complexity', 'Two Pointers', 'Sliding Window'],
  },
  'dsa-linked-lists': {
    tldr: 'Linked lists use nodes with pointers. O(1) insertion/deletion at known positions, O(n) access.',
    textContent: `# Linked Lists: Dynamic Data Structures

Linked lists consist of nodes, where each node contains data and a reference to the next node.

## Types of Linked Lists
- **Singly Linked**: Each node points to next
- **Doubly Linked**: Nodes point to both next and previous
- **Circular**: Last node points back to first

## Advantages over Arrays
- Dynamic size
- Efficient insertion/deletion at known positions
- No memory waste from pre-allocation

## Common Operations
1. **Insertion at Head**: Create node, point to current head, update head
2. **Insertion at Tail**: Traverse to end, point last node to new node
3. **Deletion**: Update previous node's pointer to skip target node`,
    concepts: ['Node Structure', 'Traversal', 'Insertion', 'Deletion'],
  },
  'dsa-stacks': {
    tldr: 'LIFO structure - last in, first out. Push/pop operations are O(1). Used for recursion, parsing, undo.',
    textContent: `# Stacks: Last In, First Out

A stack is a linear data structure that follows the Last In, First Out (LIFO) principle.

## Core Operations
- **Push**: Add element to top - O(1)
- **Pop**: Remove top element - O(1)
- **Peek**: View top element - O(1)

## Applications
- Function call stack
- Expression evaluation
- Undo mechanisms
- Bracket matching

## Implementation
Stacks can be implemented using arrays or linked lists. Array-based is simpler but has fixed size; linked list allows dynamic growth.`,
    concepts: ['LIFO', 'Push/Pop', 'Call Stack', 'Expression Evaluation'],
  },
  'dsa-queues': {
    tldr: 'FIFO structure - first in, first out. Enqueue/dequeue are O(1). Used for BFS, scheduling, buffers.',
    textContent: `# Queues: First In, First Out

Queues follow the First In, First Out (FIFO) principle - elements are processed in the order they arrive.

## Types of Queues
- **Simple Queue**: Basic FIFO implementation
- **Circular Queue**: Wraps around to reuse space efficiently
- **Priority Queue**: Elements ordered by priority, not insertion order
- **Deque (Double-ended Queue)**: Add/remove from both ends

## Core Operations
- **Enqueue**: Add element to rear - O(1)
- **Dequeue**: Remove element from front - O(1)
- **Peek**: View front element - O(1)

## Applications
- **Breadth-First Search (BFS)** in graphs
- **Task scheduling** and job queues
- **Print spooling** systems
- **Message buffers** and I/O handling

## Implementation Details
Queues are typically implemented using circular arrays or linked lists. Array-based circular queues avoid waste by reusing freed positions.`,
    concepts: ['FIFO', 'Enqueue/Dequeue', 'Circular Queue', 'Priority Queue'],
  },
  'dsa-trees': {
    tldr: 'Hierarchical structures with nodes and edges. BST provides O(log n) operations. Used for databases, file systems.',
    textContent: `# Trees: Hierarchical Data Structures

Trees are non-linear structures consisting of nodes connected by edges, with one root node and no cycles.

## Binary Search Trees (BST)
- **Property**: Left subtree < Parent < Right subtree
- **Average Time**: O(log n) for search, insert, delete
- **Worst Case**: O(n) if tree becomes skewed (like a linked list)

## Tree Traversal Methods
- **Inorder** (LNR): Left → Node → Right → Results in sorted order for BST
- **Preorder** (NLR): Node → Left → Right → Useful for prefix expressions
- **Postorder** (LRN): Left → Right → Node → Useful for freeing memory

## Balanced Trees
- **AVL Trees**: Self-balancing BST with height difference ≤ 1
- **Red-Black Trees**: Balanced BST with color property
- **B-Trees**: Multi-way search trees, used in databases

## Applications
- Database indexing
- File systems
- Expression parsing
- Autocomplete systems`,
    concepts: ['Tree Structure', 'BST', 'Traversals', 'Balancing'],
  },
  'web-html': {
    tldr: 'HTML provides semantic structure for web pages. Key elements: tags, attributes, forms, media elements.',
    textContent: `# HTML Fundamentals: Building Web Structure

HTML (HyperText Markup Language) is the foundation of all web pages, providing semantic structure and content.

## HTML Document Structure
\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Page Title</title>
  </head>
  <body>
    <!-- Content here -->
  </body>
</html>
\`\`\`

## Semantic Elements
- **<header>**: Page or section header
- **<nav>**: Navigation links
- **<main>**: Primary content
- **<article>**: Self-contained content
- **<section>**: Thematic grouping
- **<footer>**: Page or section footer

## Common Elements
- **Headings**: <h1> to <h6> for hierarchy
- **Paragraphs**: <p> for text blocks
- **Lists**: <ul>, <ol>, <li> for organized content
- **Links**: <a href=""> for navigation
- **Images**: <img src="" alt=""> with accessibility

## Forms & Input
- <form>: Container for form elements
- <input>: Text, email, password, checkbox, radio
- <textarea>: Multi-line text input
- <select>: Dropdown menus
- <label>: Associate text with form controls`,
    concepts: ['HTML Structure', 'Semantic Elements', 'Forms', 'Accessibility'],
  },
  'web-css': {
    tldr: 'CSS styles HTML with selectors, properties, and layout systems. Flexbox and Grid enable responsive design.',
    textContent: `# CSS & Layouts: Styling for Modern Web

CSS (Cascading Style Sheets) controls the visual presentation of HTML elements.

## CSS Selectors
- **Element**: \`p { }\` - All paragraphs
- **Class**: \`.button { }\` - Elements with class
- **ID**: \`#header { }\` - Unique element
- **Attribute**: \`[type="text"] { }\` - By attribute
- **Pseudo-classes**: \`:hover\`, \`:focus\`, \`:nth-child()\`

## Box Model
Every element has: Content → Padding → Border → Margin
- **Width/Height**: Size of content
- **Padding**: Space inside border
- **Border**: Outline of element
- **Margin**: Space outside border

## Flexbox Layout
- **Container**: \`display: flex\`
- **Direction**: \`flex-direction\` (row, column)
- **Justify**: \`justify-content\` (align horizontally)
- **Align**: \`align-items\` (align vertically)
- **Wrap**: \`flex-wrap\` (multi-line or single)

## CSS Grid
- **2D Layout**: Both rows and columns
- **Grid Template**: \`grid-template-columns\`, \`grid-template-rows\`
- **Gap**: Space between grid items
- **Auto Layout**: Responsive without media queries

## Responsive Design
- **Media Queries**: \`@media (max-width: 768px) { }\`
- **Mobile First**: Style mobile, then scale up
- **Viewport Meta**: Essential for responsive behavior`,
    concepts: ['Selectors', 'Box Model', 'Flexbox', 'Grid', 'Responsive Design'],
  },
  'web-js': {
    tldr: 'JavaScript adds interactivity. Core concepts: variables, functions, DOM manipulation, events, async patterns.',
    textContent: `# JavaScript Essentials: Making Web Interactive

JavaScript is the programming language of the web, enabling dynamic and interactive experiences.

## Core Concepts
- **Variables**: \`let\`, \`const\`, \`var\` (prefer const, then let)
- **Data Types**: String, Number, Boolean, Object, Array, null, undefined
- **Operators**: Arithmetic, logical, comparison, assignment
- **Control Flow**: if/else, switch, loops (for, while)
- **Functions**: Reusable code blocks, parameters, return values

## DOM Manipulation
\`\`\`javascript
// Select elements
const element = document.querySelector('.btn');
const elements = document.querySelectorAll('p');

// Modify content
element.textContent = 'New text';
element.innerHTML = '<strong>Bold text</strong>';

// Change attributes
element.setAttribute('data-id', '123');
element.classList.add('active');
\`\`\`

## Event Handling
- **Mouse Events**: \`click\`, \`mouseover\`, \`mouseout\`
- **Form Events**: \`submit\`, \`change\`, \`input\`
- **Keyboard Events**: \`keydown\`, \`keyup\`, \`keypress\`
- **Event Delegation**: Listen on parent, handle child events

## Asynchronous JavaScript
- **Callbacks**: Functions passed to other functions
- **Promises**: Better than callbacks, \`then()\`, \`catch()\`
- **Async/Await**: Modern syntax, easier to read

## ES6+ Features
- **Arrow Functions**: \`() => { }\`
- **Destructuring**: Extract values from objects/arrays
- **Spread Operator**: \`...array\`
- **Template Literals**: \`\\\`Hello \${name}\\\`\``,
    concepts: ['Variables & Types', 'DOM API', 'Events', 'Async Patterns', 'ES6+'],
  },
  'web-react': {
    tldr: 'React builds UI with components, state, and props. Hooks enable functional components with side effects.',
    textContent: `# React Basics: Building Component UIs

React is a JavaScript library for building user interfaces with reusable components and reactive data flow.

## Components
**Functional Components** (preferred):
\`\`\`javascript
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`

**Class Components** (legacy):
\`\`\`javascript
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
\`\`\`

## JSX Syntax
- Looks like HTML but it's JavaScript
- Expressions in curly braces: \`{variable}\`
- Always close tags: \`<img />\`
- className instead of class: \`<div className="active">\`

## State & Props
- **Props**: Input data passed to components (immutable)
- **State**: Internal data that changes (mutable with setState/hooks)
- **useState Hook**: \`const [count, setCount] = useState(0)\`

## Important Hooks
- **useState**: Manage component state
- **useEffect**: Side effects (API calls, subscriptions)
- **useContext**: Global state management
- **useRef**: Direct DOM access

## Component Lifecycle (with hooks)
1. **Mount**: \`useEffect(() => { }, [])\`
2. **Update**: \`useEffect(() => { }, [dependency])\`
3. **Unmount**: Cleanup function in useEffect

## Key Principles
- **One-way Data Flow**: Parent to child
- **Virtual DOM**: React updates only changed elements
- **Keys**: Required for lists for proper re-rendering`,
    concepts: ['Components', 'JSX', 'State & Props', 'Hooks', 'Virtual DOM'],
  },
  'web-api': {
    tldr: 'APIs enable server communication via REST/HTTP. Async patterns: fetch, axios, promises, async/await.',
    textContent: `# APIs & Async Programming: Server Communication

APIs (Application Programming Interfaces) allow frontend code to communicate with backends.

## HTTP Methods
- **GET**: Retrieve data (safe, idempotent)
- **POST**: Create data (sends body)
- **PUT**: Replace entire resource
- **PATCH**: Partial update
- **DELETE**: Remove resource

## Status Codes
- **2xx**: Success (200 OK, 201 Created)
- **3xx**: Redirect (301, 302)
- **4xx**: Client error (400, 404, 401)
- **5xx**: Server error (500, 503)

## Fetch API
\`\`\`javascript
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

## Async/Await
\`\`\`javascript
async function getUser() {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\`

## Common Patterns
- **Error Handling**: Check response.ok before using data
- **Headers**: Set Content-Type, Authorization tokens
- **CORS**: Cross-Origin Resource Sharing restrictions
- **Authentication**: Bearer tokens, API keys`,
    concepts: ['HTTP Methods', 'Fetch API', 'Async/Await', 'Error Handling', 'CORS'],
  },
  'ml-intro': {
    tldr: 'ML learns patterns from data. Types: supervised (labeled), unsupervised (unlabeled), reinforcement (rewards).',
    textContent: `# Machine Learning Foundations: Core Concepts

Machine Learning is a subset of AI that learns patterns from data without explicit programming.

## Three Types of Learning

### Supervised Learning
- **Input**: Labeled data (features + target)
- **Goal**: Predict target for new inputs
- **Examples**: 
  - Classification: Email spam detection, image recognition
  - Regression: House price prediction, stock price forecasting
- **Algorithms**: Linear Regression, Decision Trees, SVM, Neural Networks

### Unsupervised Learning
- **Input**: Unlabeled data (features only)
- **Goal**: Find patterns, structure, clusters
- **Examples**:
  - Clustering: Customer segmentation, image grouping
  - Dimensionality Reduction: Feature extraction, visualization
- **Algorithms**: K-Means, Hierarchical Clustering, PCA

### Reinforcement Learning
- **Input**: Rewards and penalties from environment
- **Goal**: Learn optimal actions to maximize reward
- **Examples**: Game AI, Robot control, Trading systems
- **Algorithms**: Q-Learning, Policy Gradient

## ML Workflow
1. **Data Collection**: Gather relevant data
2. **Data Preprocessing**: Clean, normalize, handle missing values
3. **Feature Engineering**: Select/create relevant features
4. **Model Selection**: Choose algorithm
5. **Training**: Learn patterns from data
6. **Evaluation**: Test on unseen data
7. **Deployment**: Use in production
8. **Monitoring**: Track performance over time`,
    concepts: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'ML Pipeline'],
  },
  'ml-regression': {
    tldr: 'Regression predicts continuous values. Linear regression: simple and interpretable. Polynomial: fits curves.',
    textContent: `# Regression: Predicting Continuous Values

Regression models predict numerical values based on input features.

## Linear Regression
**Model**: \`y = mx + b\` (or \`y = w·x + b\` in ML)
- **Simple**: Easy to understand and implement
- **Interpretable**: Coefficients show feature importance
- **Limitation**: Assumes linear relationship

### Multiple Linear Regression
\`\`\`
y = b + w₁x₁ + w₂x₂ + ... + wₙxₙ
\`\`\`
- Multiple features predict single target
- Generalizes linear regression to higher dimensions

## Polynomial Regression
- Fits curves instead of straight lines
- Uses polynomial features: x², x³, etc.
- Risk of overfitting with high-degree polynomials

## Cost Function & Optimization
- **Mean Squared Error (MSE)**: Average squared prediction errors
- **Gradient Descent**: Iteratively reduce cost
  - Learning Rate: Controls step size
  - Convergence: Algorithm finds optimal weights

## Model Evaluation Metrics
- **R² Score**: Proportion of variance explained (0 to 1)
- **RMSE**: Root mean squared error (in original units)
- **MAE**: Mean absolute error (average deviation)

## When to Use Regression
- Housing price prediction
- Stock price forecasting
- Demand forecasting
- Performance estimation`,
    concepts: ['Linear Regression', 'Polynomial Regression', 'Cost Function', 'Gradient Descent'],
  },
  'ml-classification': {
    tldr: 'Classification predicts categories. Logistic regression, decision trees, SVM are common classifiers.',
    textContent: `# Classification: Predicting Categories

Classification models predict categorical outputs (discrete classes) from input features.

## Binary Classification
- **Two Classes**: Yes/No, Spam/Ham, Cat/Dog
- **Common Use**: Medical diagnosis, email filtering

### Logistic Regression
- Despite name, it's classification not regression
- Uses sigmoid function to output probability (0 to 1)
- Threshold (usually 0.5) determines class prediction
- Interpretable: log odds of features

## Multiclass Classification
- **Multiple Classes**: Image recognition (10 digits), sentiment (5 ratings)
- **Approaches**:
  - One-vs-Rest: Train binary classifier for each class
  - One-vs-One: Train classifier for each pair
  - Softmax: Extends logistic regression

## Decision Trees
- **Visual**: Easy to understand tree-like structure
- **How it works**: Split features recursively based on information gain
- **Interpretable**: Shows decision rules
- **Limitations**: Prone to overfitting

## Support Vector Machines (SVM)
- Finds optimal decision boundary
- Maximizes margin between classes
- Handles non-linear problems with kernel trick
- Effective but less interpretable

## Evaluation Metrics
- **Accuracy**: Correct predictions / total predictions
- **Precision**: True positives / all positive predictions (reduce false positives)
- **Recall**: True positives / all actual positives (reduce false negatives)
- **F1 Score**: Harmonic mean of precision and recall
- **Confusion Matrix**: Shows TP, TN, FP, FN`,
    concepts: ['Binary Classification', 'Logistic Regression', 'Decision Trees', 'SVM', 'Metrics'],
  },
  'ml-neural': {
    tldr: 'Neural networks mimic brain neurons. Layers, weights, activation functions, backpropagation enable learning.',
    textContent: `# Neural Networks: Deep Learning Fundamentals

Neural networks are inspired by biological neurons and form the foundation of deep learning.

## Network Architecture
### Layers
- **Input Layer**: Features from data
- **Hidden Layers**: Learn intermediate representations
- **Output Layer**: Final predictions

### Neurons (Perceptrons)
\`\`\`
output = activation(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)
\`\`\`
- **Weights (w)**: Learned parameters
- **Bias (b)**: Shift term
- **Activation Function**: Introduces non-linearity

## Activation Functions
- **ReLU** (Rectified Linear): max(0, x) - Fast, popular
- **Sigmoid**: 1/(1+e^-x) - Outputs 0-1, squashes values
- **Tanh**: Hyperbolic tangent - Outputs -1 to 1
- **Softmax**: Multi-class probability distribution

## Training: Backpropagation
1. **Forward Pass**: Compute predictions
2. **Calculate Loss**: Measure prediction error
3. **Backward Pass**: Compute gradients using chain rule
4. **Update Weights**: Gradient descent adjusts weights

## Loss Functions
- **MSE**: Regression tasks
- **Cross-Entropy**: Classification tasks
- **Binary Cross-Entropy**: Binary classification

## Key Concepts
- **Epochs**: Full passes through training data
- **Batch Size**: Data points per gradient update
- **Learning Rate**: Controls update step size
- **Overfitting**: Model memorizes noise, needs regularization`,
    concepts: ['Network Architecture', 'Activation Functions', 'Backpropagation', 'Overfitting'],
  },
  'ml-practical': {
    tldr: 'Feature engineering, model validation, hyperparameter tuning, and deployment are critical for production ML.',
    textContent: `# Practical Machine Learning: From Notebook to Production

Building effective ML systems requires more than just algorithms - proper data handling and deployment.

## Data Preprocessing
- **Handling Missing Values**: Imputation, deletion, forward fill
- **Outlier Detection**: Identify and handle anomalies
- **Scaling**: Standardization (mean=0, std=1) or normalization (0-1)
- **Encoding**: Convert categorical to numerical (one-hot, label encoding)

## Feature Engineering
- **Feature Selection**: Keep important features, remove noise
- **Feature Creation**: Combine features for better patterns
- **Domain Knowledge**: Use business insights
- **Dimensionality Reduction**: PCA for high-dimensional data

## Model Validation
- **Train/Validation/Test Split**: 70/15/15 or 80/20
- **Cross-Validation**: K-fold validates on different subsets
- **Learning Curves**: Check for bias/variance issues

## Hyperparameter Tuning
- **Grid Search**: Try all combinations (exhaustive)
- **Random Search**: Sample random combinations (faster)
- **Bayesian Optimization**: Smart sampling based on results
- **Common Parameters**: Learning rate, regularization, batch size

## Addressing Common Problems
- **Underfitting** (High Bias): More complex model, more features
- **Overfitting** (High Variance): More data, regularization, early stopping
- **Class Imbalance**: Weighted loss, oversampling, SMOTE

## Production Deployment
- **Model Serialization**: Save trained models (pickle, joblib)
- **API Creation**: REST endpoint for predictions
- **Monitoring**: Track model performance over time
- **Retraining**: Update models as new data arrives`,
    concepts: ['Feature Engineering', 'Model Validation', 'Hyperparameter Tuning', 'Production ML'],
  },
};

// Diagnostic quiz questions per domain
export const DIAGNOSTIC_QUESTIONS: Record<string, Array<{
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  concept: string;
}>> = {
  dsa: [
    {
      id: 'dsa-q1',
      question: 'What is the time complexity of accessing an element in an array by index?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctIndex: 0,
      concept: 'Array Complexity',
    },
    {
      id: 'dsa-q2',
      question: 'Which data structure follows LIFO (Last In First Out)?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctIndex: 1,
      concept: 'Data Structure Types',
    },
    {
      id: 'dsa-q3',
      question: 'What is the worst-case time complexity of searching in an unbalanced BST?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 2,
      concept: 'Tree Operations',
    },
    {
      id: 'dsa-q4',
      question: 'Which traversal of a BST gives elements in sorted order?',
      options: ['Preorder', 'Postorder', 'Inorder', 'Level order'],
      correctIndex: 2,
      concept: 'Tree Traversal',
    },
    {
      id: 'dsa-q5',
      question: 'What is the main advantage of a linked list over an array?',
      options: ['Faster access', 'Dynamic size', 'Less memory', 'Simpler implementation'],
      correctIndex: 1,
      concept: 'Linked Lists',
    },
  ],
  webdev: [
    {
      id: 'web-q1',
      question: 'Which HTML element is used for the largest heading?',
      options: ['<heading>', '<h6>', '<h1>', '<head>'],
      correctIndex: 2,
      concept: 'HTML Basics',
    },
    {
      id: 'web-q2',
      question: 'What CSS property is used to change text color?',
      options: ['text-color', 'font-color', 'color', 'text-style'],
      correctIndex: 2,
      concept: 'CSS Basics',
    },
    {
      id: 'web-q3',
      question: 'Which method adds an element to the end of a JavaScript array?',
      options: ['append()', 'push()', 'add()', 'insert()'],
      correctIndex: 1,
      concept: 'JavaScript Arrays',
    },
    {
      id: 'web-q4',
      question: 'What hook is used to manage state in React functional components?',
      options: ['useEffect', 'useState', 'useContext', 'useRef'],
      correctIndex: 1,
      concept: 'React Hooks',
    },
    {
      id: 'web-q5',
      question: 'Which HTTP method is typically used to fetch data?',
      options: ['POST', 'PUT', 'GET', 'DELETE'],
      correctIndex: 2,
      concept: 'HTTP Methods',
    },
  ],
  'ai-ml': [
    {
      id: 'ml-q1',
      question: 'Which type of learning uses labeled data?',
      options: ['Unsupervised', 'Supervised', 'Reinforcement', 'Semi-supervised'],
      correctIndex: 1,
      concept: 'ML Types',
    },
    {
      id: 'ml-q2',
      question: 'What is the purpose of the activation function in a neural network?',
      options: ['Speed up training', 'Introduce non-linearity', 'Reduce overfitting', 'Initialize weights'],
      correctIndex: 1,
      concept: 'Neural Networks',
    },
    {
      id: 'ml-q3',
      question: 'Which algorithm is commonly used for classification?',
      options: ['Linear Regression', 'K-Means', 'Logistic Regression', 'PCA'],
      correctIndex: 2,
      concept: 'Classification',
    },
    {
      id: 'ml-q4',
      question: 'What does overfitting mean?',
      options: ['Model is too simple', 'Model memorizes training data', 'Model has high bias', 'Model converges too fast'],
      correctIndex: 1,
      concept: 'Model Evaluation',
    },
    {
      id: 'ml-q5',
      question: 'Which technique is used to prevent overfitting?',
      options: ['Adding more layers', 'Regularization', 'Increasing learning rate', 'Using more features'],
      correctIndex: 1,
      concept: 'Regularization',
    },
  ],
};

// Module quiz questions
export const MODULE_QUESTIONS: Record<string, Array<{
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  concept: string;
}>> = {
  'dsa-arrays': [
    {
      id: 'arr-q1',
      question: 'What is the space complexity of an array of n elements?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctIndex: 1,
      concept: 'Space Complexity',
    },
    {
      id: 'arr-q2',
      question: 'Which technique uses two indices moving toward each other?',
      options: ['Sliding Window', 'Two Pointers', 'Binary Search', 'Prefix Sum'],
      correctIndex: 1,
      concept: 'Two Pointers',
    },
    {
      id: 'arr-q3',
      question: 'What is the best approach for finding a pair with a target sum in a sorted array?',
      options: ['Nested loops O(n²)', 'Two pointers O(n)', 'Hash map only', 'Sorting first'],
      correctIndex: 1,
      concept: 'Problem Solving',
    },
  ],
  'dsa-linked-lists': [
    {
      id: 'll-q1',
      question: 'In a singly linked list, each node contains?',
      options: ['Only data', 'Data and one pointer', 'Data and two pointers', 'Only pointers'],
      correctIndex: 1,
      concept: 'Node Structure',
    },
    {
      id: 'll-q2',
      question: 'Time complexity to insert at the beginning of a linked list?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctIndex: 0,
      concept: 'Insertion',
    },
    {
      id: 'll-q3',
      question: 'How do you detect a cycle in a linked list efficiently?',
      options: ['Store all nodes', 'Fast and slow pointers', 'Reverse the list', 'Count nodes'],
      correctIndex: 1,
      concept: 'Cycle Detection',
    },
  ],
  'dsa-stacks': [
    {
      id: 'stk-q1',
      question: 'Which operation removes an element from a stack?',
      options: ['Push', 'Pop', 'Peek', 'Enqueue'],
      correctIndex: 1,
      concept: 'Stack Operations',
    },
    {
      id: 'stk-q2',
      question: 'What happens when you pop from an empty stack?',
      options: ['Returns null', 'Underflow error', 'Returns 0', 'No operation'],
      correctIndex: 1,
      concept: 'Error Handling',
    },
    {
      id: 'stk-q3',
      question: 'Which application uses a stack data structure?',
      options: ['Print queue', 'Browser back button', 'Round-robin scheduling', 'BFS'],
      correctIndex: 1,
      concept: 'Applications',
    },
  ],
  'dsa-queues': [
    {
      id: 'q-q1',
      question: 'What does FIFO stand for?',
      options: ['First In First Out', 'First In For Output', 'Fast Input For Output', 'File In File Out'],
      correctIndex: 0,
      concept: 'Queue Basics',
    },
    {
      id: 'q-q2',
      question: 'Which operation adds an element to the end of a queue?',
      options: ['Dequeue', 'Peek', 'Enqueue', 'Push'],
      correctIndex: 2,
      concept: 'Queue Operations',
    },
    {
      id: 'q-q3',
      question: 'Time complexity to dequeue from a queue?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctIndex: 0,
      concept: 'Time Complexity',
    },
  ],
  'dsa-trees': [
    {
      id: 'tree-q1',
      question: 'What is the property of a Binary Search Tree?',
      options: ['No specific order', 'Left < Parent < Right', 'All values equal', 'Random arrangement'],
      correctIndex: 1,
      concept: 'BST Property',
    },
    {
      id: 'tree-q2',
      question: 'Which traversal gives sorted output for a BST?',
      options: ['Preorder', 'Postorder', 'Inorder', 'Level order'],
      correctIndex: 2,
      concept: 'Tree Traversal',
    },
    {
      id: 'tree-q3',
      question: 'What is the advantage of balanced trees?',
      options: ['Takes less memory', 'Guaranteed O(log n) operations', 'Easier to implement', 'Faster memory access'],
      correctIndex: 1,
      concept: 'Balanced Trees',
    },
  ],
  'web-html': [
    {
      id: 'html-q1',
      question: 'Which element is used for the main content of a page?',
      options: ['<header>', '<main>', '<section>', '<article>'],
      correctIndex: 1,
      concept: 'Semantic Elements',
    },
    {
      id: 'html-q2',
      question: 'What is the correct DOCTYPE for HTML5?',
      options: ['<!DOCTYPE html>', '<!DOCTYPE HTML5>', '<!DOCTYPE html5>', '<!html>'],
      correctIndex: 0,
      concept: 'HTML Structure',
    },
    {
      id: 'html-q3',
      question: 'Which attribute provides alternative text for images?',
      options: ['src', 'alt', 'title', 'desc'],
      correctIndex: 1,
      concept: 'Accessibility',
    },
  ],
  'web-css': [
    {
      id: 'css-q1',
      question: 'Which CSS property controls spacing inside an element?',
      options: ['margin', 'padding', 'border', 'outline'],
      correctIndex: 1,
      concept: 'Box Model',
    },
    {
      id: 'css-q2',
      question: 'What value of display creates a flex container?',
      options: ['display: grid', 'display: flex', 'display: inline', 'display: block'],
      correctIndex: 1,
      concept: 'Flexbox',
    },
    {
      id: 'css-q3',
      question: 'Which media query checks for mobile devices?',
      options: ['@media (min-width: 1200px)', '@media (max-width: 768px)', '@media mobile', '@media small'],
      correctIndex: 1,
      concept: 'Responsive Design',
    },
  ],
  'web-js': [
    {
      id: 'js-q1',
      question: 'What method selects an element by class name in modern JavaScript?',
      options: ['getElementById', 'getElementsByClassName', 'querySelector', 'getElementByClass'],
      correctIndex: 2,
      concept: 'DOM Selection',
    },
    {
      id: 'js-q2',
      question: 'Which keyword is used for asynchronous functions?',
      options: ['async', 'await', 'promise', 'then'],
      correctIndex: 0,
      concept: 'Async/Await',
    },
    {
      id: 'js-q3',
      question: 'What does const mean in JavaScript?',
      options: ['Can be reassigned', 'Cannot be reassigned', 'Global variable', 'Function constant'],
      correctIndex: 1,
      concept: 'Variables',
    },
  ],
  'web-react': [
    {
      id: 'react-q1',
      question: 'Which hook manages component state in functional components?',
      options: ['useEffect', 'useState', 'useContext', 'useCallback'],
      correctIndex: 1,
      concept: 'Hooks',
    },
    {
      id: 'react-q2',
      question: 'What is the dependency array in useEffect for?',
      options: ['Store component data', 'Control when effect runs', 'Update props', 'Render children'],
      correctIndex: 1,
      concept: 'useEffect',
    },
    {
      id: 'react-q3',
      question: 'How are properties passed from parent to child in React?',
      options: ['state', 'props', 'context', 'ref'],
      correctIndex: 1,
      concept: 'Props',
    },
  ],
  'web-api': [
    {
      id: 'api-q1',
      question: 'Which HTTP method is used to update an entire resource?',
      options: ['POST', 'PATCH', 'PUT', 'DELETE'],
      correctIndex: 2,
      concept: 'HTTP Methods',
    },
    {
      id: 'api-q2',
      question: 'What does JSON stand for?',
      options: ['Java Script Object Notation', 'JavaScript Object Notation', 'Java Script Online Notation', 'JavaScript Object Network'],
      correctIndex: 1,
      concept: 'Data Format',
    },
    {
      id: 'api-q3',
      question: 'Which is the modern way to handle async operations in JavaScript?',
      options: ['Callbacks', 'Promises', 'Async/Await', 'Events'],
      correctIndex: 2,
      concept: 'Async Patterns',
    },
  ],
  'ml-intro': [
    {
      id: 'ml-intro-q1',
      question: 'What is the main difference between supervised and unsupervised learning?',
      options: ['Supervised uses labels, unsupervised does not', 'Supervised is faster', 'Unsupervised uses more data', 'No difference'],
      correctIndex: 0,
      concept: 'ML Types',
    },
    {
      id: 'ml-intro-q2',
      question: 'Which step comes first in the ML workflow?',
      options: ['Model Selection', 'Data Collection', 'Training', 'Evaluation'],
      correctIndex: 1,
      concept: 'ML Pipeline',
    },
    {
      id: 'ml-intro-q3',
      question: 'What is the purpose of the test set in ML?',
      options: ['Train the model', 'Validate hyperparameters', 'Evaluate final model performance', 'Debug code'],
      correctIndex: 2,
      concept: 'Model Validation',
    },
  ],
  'ml-regression': [
    {
      id: 'ml-reg-q1',
      question: 'What does linear regression predict?',
      options: ['Categories', 'Continuous values', 'Clusters', 'Probabilities'],
      correctIndex: 1,
      concept: 'Regression',
    },
    {
      id: 'ml-reg-q2',
      question: 'Which metric measures goodness of fit in regression?',
      options: ['Accuracy', 'F1 Score', 'R² Score', 'Precision'],
      correctIndex: 2,
      concept: 'Evaluation Metrics',
    },
    {
      id: 'ml-reg-q3',
      question: 'What problem occurs when fitting high-degree polynomials?',
      options: ['Underfitting', 'Overfitting', 'Bias', 'No learning'],
      correctIndex: 1,
      concept: 'Polynomial Regression',
    },
  ],
  'ml-classification': [
    {
      id: 'ml-class-q1',
      question: 'Which algorithm is used for binary classification?',
      options: ['Linear Regression', 'Logistic Regression', 'K-Means', 'PCA'],
      correctIndex: 1,
      concept: 'Classification',
    },
    {
      id: 'ml-class-q2',
      question: 'What does precision measure?',
      options: ['True Positives / All Actual Positives', 'True Positives / All Predicted Positives', 'Total Correct / Total', 'Errors only'],
      correctIndex: 1,
      concept: 'Metrics',
    },
    {
      id: 'ml-class-q3',
      question: 'Which model type is easily interpretable?',
      options: ['Neural Networks', 'Deep Learning', 'Decision Trees', 'SVM'],
      correctIndex: 2,
      concept: 'Model Interpretability',
    },
  ],
  'ml-neural': [
    {
      id: 'ml-nn-q1',
      question: 'What is the purpose of activation functions in neural networks?',
      options: ['Initialize weights', 'Introduce non-linearity', 'Reduce overfitting', 'Speed up training'],
      correctIndex: 1,
      concept: 'Activation Functions',
    },
    {
      id: 'ml-nn-q2',
      question: 'Which activation function is most commonly used in hidden layers?',
      options: ['Sigmoid', 'ReLU', 'Tanh', 'Softmax'],
      correctIndex: 1,
      concept: 'ReLU',
    },
    {
      id: 'ml-nn-q3',
      question: 'What algorithm computes gradients in backpropagation?',
      options: ['Forward Pass', 'Chain Rule', 'Gradient Descent', 'Loss Function'],
      correctIndex: 1,
      concept: 'Backpropagation',
    },
  ],
  'ml-practical': [
    {
      id: 'ml-prac-q1',
      question: 'What is feature scaling used for?',
      options: ['Reduce features', 'Normalize feature ranges', 'Increase accuracy', 'Reduce overfitting'],
      correctIndex: 1,
      concept: 'Preprocessing',
    },
    {
      id: 'ml-prac-q2',
      question: 'Which technique prevents overfitting?',
      options: ['Using more features', 'Increasing learning rate', 'Regularization', 'Larger models'],
      correctIndex: 2,
      concept: 'Regularization',
    },
    {
      id: 'ml-prac-q3',
      question: 'What is k-fold cross-validation used for?',
      options: ['Feature selection', 'Data splitting for validation', 'Hyperparameter tuning only', 'Model deployment'],
      correctIndex: 1,
      concept: 'Model Validation',
    },
  ],
};

// Content format recommendation rules (simulated AI decision)
export function getRecommendedFormat(diagnosticScore: number, avgTimePerQuestion: number): 'video' | 'text' | 'mixed' {
  // Simulate AI decision based on analytics
  if (diagnosticScore < 40) {
    // Low score suggests need for more visual content
    return 'video';
  } else if (avgTimePerQuestion < 10) {
    // Quick answers suggest familiarity - text is fine
    return 'text';
  } else {
    // Default to mixed approach
    return 'mixed';
  }
}

// Revision urgency calculation (memory-aware)
export function calculateRevisionUrgency(
  lastCompletedAt: Date | null,
  score: number,
  attempts: number
): 'high' | 'medium' | 'low' {
  if (!lastCompletedAt) return 'high';
  
  const daysSince = Math.floor((Date.now() - lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24));
  
  // Ebbinghaus forgetting curve inspired logic
  if (score < 60 || daysSince > 7) {
    return 'high';
  } else if (score < 80 || daysSince > 3) {
    return 'medium';
  } else {
    return 'low';
  }
}

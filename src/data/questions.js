var questions = [
  {
    id: 1,
    question: "Which language is primarily used to structure content on the web?",
    options: ["CSS", "HTML", "JavaScript", "Ruby"],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Which keyword is required by this project's JavaScript convention for variable declarations?",
    options: ["let", "const", "var", "define"],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: "Which operator checks both value and data type in JavaScript without type coercion?",
    options: ["==", "=", "===", "!="],
    correctAnswer: 2,
  },
  {
    id: 4,
    question: "What does CSS primarily control in web applications?",
    options: [
      "Database records",
      "Page presentation and styling",
      "Server authentication",
      "Git version control",
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: "Which command creates a new Git branch and switches to it?",
    options: [
      "git checkout -b <branch>",
      "git clone <repo>",
      "git status",
      "git diff",
    ],
    correctAnswer: 0,
  },
  {
    id: 6,
    question: "In React, which hook is used to perform side effects such as data fetching or subscriptions?",
    options: ["useState", "useEffect", "useMemo", "useRef"],
    correctAnswer: 1,
  },
  {
    id: 7,
    question: "What are the three parts of a JSON Web Token (JWT) separated by dots?",
    options: [
      "Header, Body, Footer",
      "Header, Payload, Signature",
      "Public Key, Private Key, Data",
      "Request, Response, Status",
    ],
    correctAnswer: 1,
  },
  {
    id: 8,
    question: "Which HTTP status code indicates that a request was successful (OK)?",
    options: ["200", "401", "404", "500"],
    correctAnswer: 0,
  },
  {
    id: 9,
    question: "Which JavaScript array method creates a new array by transforming every element with a function?",
    options: ["filter()", "forEach()", "map()", "reduce()"],
    correctAnswer: 2,
  },
  {
    id: 10,
    question: "In HTML, which semantic tag represents the main introductory content or navigation for a page or section?",
    options: ["<aside>", "<header>", "<footer>", "<article>"],
    correctAnswer: 1,
  },
  {
    id: 11,
    question: "What is the primary purpose of the 'Authorization' header when using JWT?",
    options: [
      "To specify response caching rules",
      "To transmit the Bearer token for client authentication",
      "To define the payload encoding format",
      "To compress the request payload",
    ],
    correctAnswer: 1,
  },
  {
    id: 12,
    question: "Which React concept allows passing data down through the component tree without prop drilling?",
    options: ["Context API", "Virtual DOM", "React Fragments", "Error Boundaries"],
    correctAnswer: 0,
  },
  {
    id: 13,
    question: "In Tailwind CSS, which classes apply flexbox layout with items centered along the main axis?",
    options: [
      "flex justify-center",
      "display-flex align-center",
      "flex-center",
      "items-middle",
    ],
    correctAnswer: 0,
  },
  {
    id: 14,
    question: "What does the HTTP 401 status code stand for?",
    options: ["Forbidden", "Bad Request", "Unauthorized", "Not Found"],
    correctAnswer: 2,
  },
  {
    id: 15,
    question: "In JavaScript, what does `typeof null` evaluate to due to a historical design quirk?",
    options: ["'null'", "'undefined'", "'object'", "'boolean'"],
    correctAnswer: 2,
  },
];

export default questions;

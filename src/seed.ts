import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SubjectsService } from "./subjects/subjects.service";
import { QuizzesService } from "./quizzes/quizzes.service";
import { UsersService } from "./users/users.service";
import { SubjectName } from "./common/constants/subject-type.enum";
import { QuizLevel } from "./common/constants/quiz-level.enum";
import { UserRole } from "./common/constants/roles.enum";
import { User, UserDocument } from "./users/user.schema";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";

// AI Question Generator - Generates random questions for each subject/level
function generateAIQuestions(
  subject: SubjectName,
  level: QuizLevel,
  count: number = 20
): Array<{
  text: string;
  type: string;
  options: Array<{ text: string; isCorrect: boolean }>;
}> {
  const questions: Array<{
    text: string;
    type: string;
    options: Array<{ text: string; isCorrect: boolean }>;
  }> = [];

  // Question templates for each subject and level
  const questionTemplates: Record<
    string,
    Record<
      string,
      Array<{ question: string; options: string[]; correctIndex: number }>
    >
  > = {
    HTML: {
      beginner: [
        {
          question: "What does HTML stand for?",
          options: [
            "HyperText Markup Language",
            "High Tech Modern Language",
            "Home Tool Markup Language",
            "Hyperlink and Text Markup Language",
          ],
          correctIndex: 0,
        },
        {
          question: "Which tag is used to create a heading?",
          options: ["<heading>", "<h1>", "<head>", "<header>"],
          correctIndex: 1,
        },
        {
          question: "What is the correct HTML element for the largest heading?",
          options: ["<h6>", "<h1>", "<heading>", "<head>"],
          correctIndex: 1,
        },
        {
          question:
            "Which attribute is used to provide an alternate text for an image?",
          options: ["alt", "title", "src", "href"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <div> element?",
          options: [
            "To create a division or section",
            "To create a list",
            "To create a table",
            "To create a link",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 element is used for navigation?",
          options: ["<nav>", "<navigation>", "<menu>", "<navigate>"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of semantic HTML?",
          options: [
            "To provide meaning to the structure",
            "To make pages load faster",
            "To add styling",
            "To create animations",
          ],
          correctIndex: 0,
        },
        {
          question: "Which element is used for form validation?",
          options: [
            "<validate>",
            "HTML5 input types and attributes",
            "<check>",
            "<verify>",
          ],
          correctIndex: 1,
        },
        {
          question: "What tag is used to create a paragraph?",
          options: ["<para>", "<p>", "<paragraph>", "<text>"],
          correctIndex: 1,
        },
        {
          question: "Which tag is used to create a line break?",
          options: ["<br>", "<break>", "<lb>", "<line>"],
          correctIndex: 0,
        },
        {
          question:
            "What is the correct HTML element for inserting a hyperlink?",
          options: ["<link>", "<a>", "<href>", "<url>"],
          correctIndex: 1,
        },
        {
          question: "Which attribute is used to define inline styles?",
          options: ["style", "css", "class", "styles"],
          correctIndex: 0,
        },
        {
          question:
            "What is the correct HTML element for creating an unordered list?",
          options: ["<ul>", "<ol>", "<list>", "<li>"],
          correctIndex: 0,
        },
        {
          question: "Which tag is used to create a table row?",
          options: ["<tr>", "<row>", "<td>", "<table-row>"],
          correctIndex: 0,
        },
        {
          question: "What is the correct HTML element for creating a form?",
          options: ["<form>", "<input>", "<fieldset>", "<form-group>"],
          correctIndex: 0,
        },
        {
          question: "Which attribute is used to make an input field required?",
          options: ["required", "mandatory", "must", "needed"],
          correctIndex: 0,
        },
        {
          question: "What tag is used to create a button?",
          options: ["<button>", "<btn>", "<click>", "<action>"],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 element is used for article content?",
          options: ["<article>", "<content>", "<section>", "<main>"],
          correctIndex: 0,
        },
        {
          question: "What is the correct HTML element for creating a header?",
          options: ["<header>", "<head>", "<heading>", "<top>"],
          correctIndex: 0,
        },
        {
          question: "Which tag is used to create a footer?",
          options: ["<footer>", "<bottom>", "<end>", "<foot>"],
          correctIndex: 0,
        },
      ],
      middle: [
        {
          question: "What is the purpose of the <meta> tag?",
          options: [
            "To provide metadata about the document",
            "To create a table",
            "To add styling",
            "To create a link",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for local storage?",
          options: [
            "localStorage",
            "sessionStorage",
            "cookieStorage",
            "fileStorage",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <canvas> element?",
          options: [
            "To draw graphics via JavaScript",
            "To display images",
            "To create forms",
            "To add animations",
          ],
          correctIndex: 0,
        },
        {
          question:
            "Which attribute is used to make an input field accept only numbers?",
          options: [
            "type='number'",
            "type='numeric'",
            "type='integer'",
            "type='digit'",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <iframe> element?",
          options: [
            "To embed another HTML page",
            "To create a frame",
            "To add images",
            "To create links",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 element is used for video content?",
          options: ["<video>", "<media>", "<movie>", "<clip>"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <audio> element?",
          options: [
            "To embed audio content",
            "To create sounds",
            "To add music",
            "To play files",
          ],
          correctIndex: 0,
        },
        {
          question:
            "Which attribute is used to specify the character encoding?",
          options: ["charset", "encoding", "charset-encoding", "char-encoding"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <progress> element?",
          options: [
            "To display progress of a task",
            "To show loading",
            "To create a bar",
            "To indicate status",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 element is used for marking text?",
          options: ["<mark>", "<highlight>", "<emphasize>", "<note>"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <details> element?",
          options: [
            "To create collapsible content",
            "To add details",
            "To create sections",
            "To show information",
          ],
          correctIndex: 0,
        },
        {
          question: "Which attribute is used to make content editable?",
          options: ["contenteditable", "editable", "edit", "can-edit"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <datalist> element?",
          options: [
            "To provide autocomplete options",
            "To create lists",
            "To add data",
            "To show options",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 element is used for output?",
          options: ["<output>", "<result>", "<display>", "<show>"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <meter> element?",
          options: [
            "To display a scalar measurement",
            "To show progress",
            "To create a gauge",
            "To indicate value",
          ],
          correctIndex: 0,
        },
        {
          question:
            "Which attribute is used to specify the language of the content?",
          options: ["lang", "language", "locale", "lang-code"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <time> element?",
          options: [
            "To represent a specific time",
            "To show clock",
            "To display date",
            "To create timer",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 element is used for sidebar content?",
          options: ["<aside>", "<sidebar>", "<side>", "<nav>"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <figure> element?",
          options: [
            "To group media content with caption",
            "To add images",
            "To create figures",
            "To show media",
          ],
          correctIndex: 0,
        },
        {
          question:
            "Which attribute is used to specify the relationship between documents?",
          options: ["rel", "relation", "link-rel", "relationship"],
          correctIndex: 0,
        },
      ],
      intermediate: [
        {
          question: "What is the purpose of Web Components?",
          options: [
            "To create reusable custom elements",
            "To add components",
            "To create modules",
            "To build widgets",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for geolocation?",
          options: ["Geolocation API", "Location API", "GPS API", "Map API"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the Shadow DOM?",
          options: [
            "To encapsulate component styles and markup",
            "To add shadows",
            "To create effects",
            "To hide content",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for drag and drop?",
          options: [
            "Drag and Drop API",
            "Move API",
            "Transfer API",
            "Shift API",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <template> element?",
          options: [
            "To hold client-side content for JavaScript",
            "To create templates",
            "To add structure",
            "To define patterns",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for file access?",
          options: [
            "File API",
            "Document API",
            "FileSystem API",
            "Storage API",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <slot> element?",
          options: [
            "To create placeholders in web components",
            "To add slots",
            "To create spaces",
            "To define areas",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for notifications?",
          options: [
            "Notification API",
            "Alert API",
            "Message API",
            "Popup API",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the Intersection Observer API?",
          options: [
            "To detect when elements enter viewport",
            "To observe changes",
            "To track elements",
            "To monitor visibility",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for clipboard operations?",
          options: ["Clipboard API", "Copy API", "Paste API", "Transfer API"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <picture> element?",
          options: [
            "To provide responsive images",
            "To add pictures",
            "To display images",
            "To create galleries",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for service workers?",
          options: [
            "Service Worker API",
            "Worker API",
            "Background API",
            "Process API",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <dialog> element?",
          options: [
            "To create modal dialogs",
            "To add dialogs",
            "To create popups",
            "To show messages",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for media capture?",
          options: [
            "Media Capture API",
            "Camera API",
            "MediaStream API",
            "Capture API",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the MutationObserver API?",
          options: [
            "To watch for DOM changes",
            "To observe mutations",
            "To track changes",
            "To monitor updates",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for fullscreen mode?",
          options: ["Fullscreen API", "Screen API", "Display API", "View API"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <main> element?",
          options: [
            "To define the main content area",
            "To create main section",
            "To add primary content",
            "To define structure",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for page visibility?",
          options: [
            "Page Visibility API",
            "Visibility API",
            "View API",
            "Display API",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of the <section> element?",
          options: [
            "To define sections of content",
            "To create sections",
            "To add divisions",
            "To group content",
          ],
          correctIndex: 0,
        },
        {
          question: "Which HTML5 API is used for battery status?",
          options: ["Battery API", "Power API", "Energy API", "Status API"],
          correctIndex: 0,
        },
      ],
    },
    CSS: {
      beginner: [
        {
          question: "What does CSS stand for?",
          options: [
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Creative Style Sheets",
            "Colorful Style Sheets",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used to change the text color?",
          options: ["font-color", "text-color", "color", "text-style"],
          correctIndex: 2,
        },
        {
          question: "How do you select an element with id 'demo'?",
          options: [".demo", "#demo", "demo", "*demo"],
          correctIndex: 1,
        },
        {
          question: "Which property is used to change the background color?",
          options: [
            "background-color",
            "bg-color",
            "color-background",
            "background",
          ],
          correctIndex: 0,
        },
        {
          question: "How do you select elements with class 'example'?",
          options: [".example", "#example", "example", "*example"],
          correctIndex: 0,
        },
        {
          question: "Which property is used to change the font size?",
          options: ["font-size", "text-size", "size", "font"],
          correctIndex: 0,
        },
        {
          question: "What is the correct way to add a comment in CSS?",
          options: [
            "/* comment */",
            "// comment",
            "<!-- comment -->",
            "# comment",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used to make text bold?",
          options: ["font-weight", "text-weight", "bold", "font-style"],
          correctIndex: 0,
        },
        {
          question: "How do you center text horizontally?",
          options: [
            "text-align: center",
            "align: center",
            "text-center",
            "center: text",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used to add space between letters?",
          options: [
            "letter-spacing",
            "text-spacing",
            "char-spacing",
            "spacing",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the default display value for a <div> element?",
          options: ["block", "inline", "flex", "grid"],
          correctIndex: 0,
        },
        {
          question: "Which property is used to change the font family?",
          options: ["font-family", "font-type", "family", "text-font"],
          correctIndex: 0,
        },
        {
          question: "How do you remove the underline from links?",
          options: [
            "text-decoration: none",
            "underline: none",
            "text-underline: none",
            "decoration: none",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used to add margin?",
          options: ["margin", "spacing", "padding", "gap"],
          correctIndex: 0,
        },
        {
          question: "What is the correct way to set multiple font sizes?",
          options: [
            "font-size: 16px",
            "size: 16px",
            "font: 16px",
            "text-size: 16px",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used to add padding?",
          options: ["padding", "spacing", "margin", "gap"],
          correctIndex: 0,
        },
        {
          question: "How do you make an element invisible?",
          options: [
            "display: none",
            "visibility: hidden",
            "opacity: 0",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "Which property is used to change text alignment?",
          options: ["text-align", "align", "text-position", "alignment"],
          correctIndex: 0,
        },
        {
          question: "What is the default value of the position property?",
          options: ["static", "relative", "absolute", "fixed"],
          correctIndex: 0,
        },
        {
          question: "Which property is used to change the cursor style?",
          options: ["cursor", "pointer", "mouse", "click"],
          correctIndex: 0,
        },
      ],
      middle: [
        {
          question: "What is the CSS Box Model?",
          options: [
            "A model describing how elements are sized",
            "A way to create boxes",
            "A layout method",
            "A styling technique",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for flexbox layout?",
          options: [
            "display: flex",
            "layout: flex",
            "flex: true",
            "display: flexbox",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of z-index?",
          options: [
            "To control stacking order",
            "To add depth",
            "To create layers",
            "To position elements",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for CSS Grid?",
          options: [
            "display: grid",
            "layout: grid",
            "grid: true",
            "display: grid-layout",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of media queries?",
          options: [
            "To create responsive designs",
            "To add media",
            "To query media",
            "To style media",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for transitions?",
          options: ["transition", "animation", "transform", "change"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS variables?",
          options: [
            "To store reusable values",
            "To create variables",
            "To define constants",
            "To store data",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for animations?",
          options: ["animation", "transition", "transform", "motion"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @media rule?",
          options: [
            "To apply styles based on device",
            "To add media",
            "To query media",
            "To style media",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for transforms?",
          options: ["transform", "transition", "animation", "change"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of pseudo-classes?",
          options: [
            "To style elements in specific states",
            "To create classes",
            "To add styles",
            "To define states",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for box-shadow?",
          options: ["box-shadow", "shadow", "element-shadow", "drop-shadow"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS specificity?",
          options: [
            "To determine which styles are applied",
            "To add specificity",
            "To define priority",
            "To set importance",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for border-radius?",
          options: ["border-radius", "radius", "round", "corner-radius"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @keyframes?",
          options: [
            "To define animation sequences",
            "To create keyframes",
            "To add animations",
            "To define frames",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for opacity?",
          options: ["opacity", "transparency", "alpha", "visibility"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS preprocessors?",
          options: [
            "To extend CSS with features",
            "To process CSS",
            "To compile CSS",
            "To transform CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for text-shadow?",
          options: ["text-shadow", "shadow", "text-effect", "font-shadow"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS modules?",
          options: [
            "To scope CSS to components",
            "To create modules",
            "To organize CSS",
            "To structure styles",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for backdrop-filter?",
          options: [
            "backdrop-filter",
            "filter",
            "background-filter",
            "blur-filter",
          ],
          correctIndex: 0,
        },
      ],
      intermediate: [
        {
          question: "What is CSS-in-JS?",
          options: [
            "Writing CSS in JavaScript",
            "CSS in Java",
            "CSS in JSON",
            "CSS in JSX",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for CSS containment?",
          options: ["contain", "isolation", "containment", "scope"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS Houdini?",
          options: [
            "To extend CSS with JavaScript APIs",
            "To add features",
            "To create APIs",
            "To extend capabilities",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for aspect-ratio?",
          options: ["aspect-ratio", "ratio", "proportion", "scale"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS logical properties?",
          options: [
            "To support different writing modes",
            "To add logic",
            "To create properties",
            "To define logic",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for content-visibility?",
          options: ["content-visibility", "visibility", "display", "opacity"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS custom properties?",
          options: [
            "To create reusable CSS variables",
            "To add properties",
            "To define variables",
            "To create constants",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for scroll-snap?",
          options: ["scroll-snap-type", "snap", "scroll-snap", "snap-type"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS subgrid?",
          options: [
            "To create nested grid layouts",
            "To add grids",
            "To create sub-grids",
            "To define grids",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for container queries?",
          options: [
            "container-type",
            "container",
            "query-container",
            "container-query",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS layers?",
          options: [
            "To organize and cascade styles",
            "To create layers",
            "To add layers",
            "To define layers",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for color-mix?",
          options: ["color-mix", "mix-color", "blend-color", "combine-color"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS anchor positioning?",
          options: [
            "To position elements relative to anchors",
            "To add anchors",
            "To create positions",
            "To define anchors",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for view transitions?",
          options: [
            "view-transition-name",
            "transition",
            "view-transition",
            "transition-name",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS nesting?",
          options: [
            "To nest selectors within rules",
            "To add nesting",
            "To create nests",
            "To define structure",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for font-palette?",
          options: ["font-palette", "palette", "color-palette", "font-colors"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS cascade layers?",
          options: [
            "To control style precedence",
            "To add layers",
            "To create cascades",
            "To define precedence",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for text-wrap?",
          options: ["text-wrap", "wrap", "text-break", "line-wrap"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of CSS scope?",
          options: [
            "To scope styles to specific elements",
            "To add scope",
            "To create scopes",
            "To define scope",
          ],
          correctIndex: 0,
        },
        {
          question: "Which property is used for initial-letter?",
          options: [
            "initial-letter",
            "drop-cap",
            "first-letter",
            "letter-drop",
          ],
          correctIndex: 0,
        },
      ],
    },
    JavaScript: {
      beginner: [
        {
          question: "What is JavaScript?",
          options: [
            "A programming language",
            "A markup language",
            "A styling language",
            "A database",
          ],
          correctIndex: 0,
        },
        {
          question: "Which keyword is used to declare a variable?",
          options: ["var", "let", "const", "All of the above"],
          correctIndex: 3,
        },
        {
          question: "What is the result of 2 + '2' in JavaScript?",
          options: ["4", "'22'", "22", "Error"],
          correctIndex: 1,
        },
        {
          question: "Which method is used to add an element to an array?",
          options: ["push()", "add()", "append()", "insert()"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of console.log()?",
          options: [
            "To output messages to console",
            "To log errors",
            "To create logs",
            "To debug code",
          ],
          correctIndex: 0,
        },
        {
          question: "Which operator is used for strict equality?",
          options: ["===", "==", "=", "!="],
          correctIndex: 0,
        },
        {
          question: "What is the result of typeof null?",
          options: ["'object'", "'null'", "'undefined'", "null"],
          correctIndex: 0,
        },
        {
          question:
            "Which method is used to remove the last element from an array?",
          options: ["pop()", "remove()", "delete()", "shift()"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of a function?",
          options: [
            "To perform a specific task",
            "To store data",
            "To create variables",
            "To define types",
          ],
          correctIndex: 0,
        },
        {
          question: "Which method is used to convert a string to a number?",
          options: [
            "Number()",
            "parseInt()",
            "parseFloat()",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of if/else statements?",
          options: [
            "To make decisions in code",
            "To create conditions",
            "To check values",
            "To control flow",
          ],
          correctIndex: 0,
        },
        {
          question: "Which method is used to find an element in an array?",
          options: ["find()", "search()", "locate()", "get()"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of a loop?",
          options: [
            "To repeat code",
            "To iterate",
            "To cycle",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question:
            "Which method is used to join array elements into a string?",
          options: ["join()", "concat()", "merge()", "combine()"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of return in a function?",
          options: [
            "To return a value",
            "To exit function",
            "To send data",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "Which method is used to get the length of a string?",
          options: [".length", ".size", ".count", ".length()"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of an object?",
          options: [
            "To store key-value pairs",
            "To create data structures",
            "To organize data",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "Which method is used to add properties to an object?",
          options: [
            "Direct assignment",
            "Object.assign()",
            "Spread operator",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of arrays?",
          options: [
            "To store multiple values",
            "To create lists",
            "To organize data",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "Which method is used to iterate over array elements?",
          options: ["forEach()", "map()", "for loop", "All of the above"],
          correctIndex: 3,
        },
      ],
      middle: [
        {
          question: "What is a closure in JavaScript?",
          options: [
            "A function with access to outer scope",
            "A closed function",
            "A private function",
            "A nested function",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of promises?",
          options: [
            "To handle asynchronous operations",
            "To create promises",
            "To manage async code",
            "To handle callbacks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is destructuring?",
          options: [
            "Extracting values from arrays/objects",
            "Breaking down data",
            "Unpacking values",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of async/await?",
          options: [
            "To handle asynchronous code",
            "To create async functions",
            "To wait for promises",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is a higher-order function?",
          options: [
            "A function that takes/returns functions",
            "A complex function",
            "A nested function",
            "A callback function",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of map()?",
          options: [
            "To transform array elements",
            "To create new arrays",
            "To iterate arrays",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the spread operator?",
          options: [
            "...",
            "To spread elements",
            "To expand arrays/objects",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of filter()?",
          options: [
            "To filter array elements",
            "To create subsets",
            "To select items",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is arrow function syntax?",
          options: ["() => {}", "function() {}", "() -> {}", "function => {}"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of reduce()?",
          options: [
            "To reduce array to single value",
            "To accumulate values",
            "To combine elements",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the 'this' keyword?",
          options: [
            "Reference to current object",
            "Context reference",
            "Object reference",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of classes?",
          options: [
            "To create object blueprints",
            "To define types",
            "To structure code",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is prototype inheritance?",
          options: [
            "JavaScript's inheritance model",
            "Object inheritance",
            "Class inheritance",
            "Type inheritance",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of modules?",
          options: [
            "To organize code",
            "To export/import",
            "To create packages",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is event delegation?",
          options: [
            "Handling events on parent",
            "Event bubbling",
            "Event capturing",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of bind()?",
          options: [
            "To set 'this' context",
            "To bind functions",
            "To create bound functions",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is a callback function?",
          options: [
            "Function passed as argument",
            "A function parameter",
            "An async function",
            "A returned function",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of try/catch?",
          options: [
            "To handle errors",
            "To catch exceptions",
            "To manage errors",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is hoisting?",
          options: [
            "Moving declarations to top",
            "Variable lifting",
            "Function elevation",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of JSON?",
          options: [
            "To exchange data",
            "To serialize objects",
            "To format data",
            "All of the above",
          ],
          correctIndex: 3,
        },
      ],
      intermediate: [
        {
          question: "What is the Event Loop?",
          options: [
            "JavaScript's execution model",
            "Async handling mechanism",
            "Callback queue processor",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is a generator function?",
          options: [
            "Function that can pause/resume",
            "A special function",
            "An iterator function",
            "A yield function",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of Proxy?",
          options: [
            "To intercept object operations",
            "To create proxies",
            "To handle operations",
            "To intercept calls",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a WeakMap?",
          options: [
            "Map with weak references",
            "A special map",
            "A garbage-collected map",
            "A reference map",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of Symbol?",
          options: [
            "To create unique identifiers",
            "To add properties",
            "To create symbols",
            "To define types",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a decorator?",
          options: [
            "Function that modifies classes",
            "A modifier",
            "A wrapper",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of Reflect?",
          options: [
            "To perform object operations",
            "To reflect operations",
            "To handle metadata",
            "To process objects",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Set?",
          options: [
            "Collection of unique values",
            "A unique array",
            "A distinct collection",
            "A unique list",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of Web Workers?",
          options: [
            "To run scripts in background",
            "To create workers",
            "To handle threads",
            "To process tasks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a WeakSet?",
          options: [
            "Set with weak references",
            "A special set",
            "A garbage-collected set",
            "A reference set",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of Intl?",
          options: [
            "Internationalization API",
            "To format data",
            "To localize content",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is a TypedArray?",
          options: [
            "Array with specific type",
            "A typed array",
            "A binary array",
            "A fixed array",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of BigInt?",
          options: [
            "To represent large integers",
            "To handle big numbers",
            "To process integers",
            "To store numbers",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a SharedArrayBuffer?",
          options: [
            "Shared memory buffer",
            "A shared buffer",
            "A memory buffer",
            "A data buffer",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of Atomics?",
          options: [
            "To perform atomic operations",
            "To handle concurrency",
            "To manage operations",
            "To process data",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Promise.all()?",
          options: [
            "To wait for all promises",
            "To handle multiple promises",
            "To combine promises",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of Object.freeze()?",
          options: [
            "To prevent object modification",
            "To freeze objects",
            "To lock objects",
            "To seal objects",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Map?",
          options: [
            "Key-value collection",
            "A data structure",
            "An object alternative",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of ArrayBuffer?",
          options: [
            "To represent binary data",
            "To handle buffers",
            "To process data",
            "To store bytes",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a RegExp?",
          options: [
            "Regular expression object",
            "A pattern matcher",
            "A text processor",
            "All of the above",
          ],
          correctIndex: 3,
        },
      ],
    },
    // Add more subjects with similar structure...
    Angular: {
      beginner: [
        {
          question: "What is Angular?",
          options: [
            "A JavaScript framework",
            "A CSS library",
            "A database",
            "A programming language",
          ],
          correctIndex: 0,
        },
        {
          question: "Which command is used to create a new Angular project?",
          options: [
            "ng new",
            "angular create",
            "npm init angular",
            "create-angular",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a component in Angular?",
          options: [
            "A building block of Angular apps",
            "A database table",
            "A CSS class",
            "A JavaScript function",
          ],
          correctIndex: 0,
        },
        {
          question: "What decorator is used to define a component?",
          options: [
            "@Component",
            "@ComponentClass",
            "@AngularComponent",
            "@NgComponent",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of Angular modules?",
          options: [
            "To organize code into functional units",
            "To store data",
            "To style components",
            "To handle routing",
          ],
          correctIndex: 0,
        },
        {
          question: "Which file contains the main app component?",
          options: ["app.component.ts", "main.ts", "index.ts", "app.ts"],
          correctIndex: 0,
        },
        {
          question: "What is data binding in Angular?",
          options: [
            "Synchronizing data between component and view",
            "Binding CSS classes",
            "Linking databases",
            "Connecting APIs",
          ],
          correctIndex: 0,
        },
        {
          question: "Which syntax is used for interpolation in templates?",
          options: ["{{ }}", "[ ]", "( )", "{ }"],
          correctIndex: 0,
        },
        {
          question: "What is a directive in Angular?",
          options: [
            "A class that adds behavior to elements",
            "A database query",
            "A CSS rule",
            "A JavaScript function",
          ],
          correctIndex: 0,
        },
        {
          question: "Which directive is used for conditional rendering?",
          options: ["*ngIf", "*ngFor", "*ngSwitch", "*ngShow"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of *ngFor?",
          options: [
            "To loop through arrays",
            "To create conditions",
            "To bind data",
            "To style elements",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a service in Angular?",
          options: [
            "A class for shared business logic",
            "A database table",
            "A component",
            "A directive",
          ],
          correctIndex: 0,
        },
        {
          question: "Which decorator is used for services?",
          options: [
            "@Injectable",
            "@Service",
            "@Provider",
            "@InjectableService",
          ],
          correctIndex: 0,
        },
        {
          question: "What is dependency injection in Angular?",
          options: [
            "A design pattern for providing dependencies",
            "A database operation",
            "A routing mechanism",
            "A styling technique",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the root module in Angular?",
          options: ["AppModule", "RootModule", "MainModule", "CoreModule"],
          correctIndex: 0,
        },
        {
          question: "Which file defines the app's routing?",
          options: [
            "app-routing.module.ts",
            "routes.ts",
            "navigation.ts",
            "router.ts",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a pipe in Angular?",
          options: [
            "A way to transform data in templates",
            "A database connection",
            "A component",
            "A service",
          ],
          correctIndex: 0,
        },
        {
          question: "Which pipe is used to format dates?",
          options: ["date", "formatDate", "time", "datetime"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of ngOnInit?",
          options: [
            "Lifecycle hook called after component initialization",
            "To create components",
            "To destroy components",
            "To update components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the Angular CLI?",
          options: [
            "Command-line interface for Angular",
            "A component library",
            "A database tool",
            "A testing framework",
          ],
          correctIndex: 0,
        },
      ],
      middle: [
        {
          question: "What is Angular routing?",
          options: [
            "Navigation between views",
            "Database routing",
            "CSS routing",
            "API routing",
          ],
          correctIndex: 0,
        },
        {
          question: "Which service is used for routing?",
          options: [
            "Router",
            "RouteService",
            "NavigationService",
            "RouteManager",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a route guard?",
          options: [
            "A service to control route access",
            "A component",
            "A directive",
            "A pipe",
          ],
          correctIndex: 0,
        },
        {
          question: "What is lazy loading in Angular?",
          options: [
            "Loading modules on demand",
            "Loading all modules at once",
            "Loading CSS",
            "Loading images",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of HttpClient?",
          options: [
            "To make HTTP requests",
            "To handle routing",
            "To manage state",
            "To style components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is an Observable in Angular?",
          options: [
            "A stream of data over time",
            "A database query",
            "A component",
            "A service",
          ],
          correctIndex: 0,
        },
        {
          question: "Which operator is used to transform Observable data?",
          options: ["map", "filter", "reduce", "forEach"],
          correctIndex: 0,
        },
        {
          question: "What is RxJS?",
          options: [
            "Reactive Extensions library for JavaScript",
            "A database",
            "A component library",
            "A testing tool",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Subject in RxJS?",
          options: [
            "A special type of Observable",
            "A component",
            "A service",
            "A directive",
          ],
          correctIndex: 0,
        },
        {
          question: "What is form validation in Angular?",
          options: [
            "Validating user input",
            "Validating routes",
            "Validating services",
            "Validating components",
          ],
          correctIndex: 0,
        },
        {
          question: "Which module is needed for reactive forms?",
          options: [
            "ReactiveFormsModule",
            "FormsModule",
            "FormModule",
            "ReactiveModule",
          ],
          correctIndex: 0,
        },
        {
          question: "What is FormGroup?",
          options: [
            "A collection of form controls",
            "A single input",
            "A validation rule",
            "A form directive",
          ],
          correctIndex: 0,
        },
        {
          question: "What is FormControl?",
          options: [
            "A single form input control",
            "A form group",
            "A validation service",
            "A form component",
          ],
          correctIndex: 0,
        },
        {
          question: "What is change detection in Angular?",
          options: [
            "Mechanism to detect and propagate changes",
            "A database change",
            "A routing change",
            "A service change",
          ],
          correctIndex: 0,
        },
        {
          question: "What is OnPush change detection strategy?",
          options: [
            "Optimization strategy for change detection",
            "A routing strategy",
            "A validation strategy",
            "A styling strategy",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a ViewChild?",
          options: [
            "A decorator to access child elements",
            "A component",
            "A service",
            "A directive",
          ],
          correctIndex: 0,
        },
        {
          question: "What is ContentChild?",
          options: [
            "A decorator to access projected content",
            "A component",
            "A service",
            "A pipe",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Angular Material?",
          options: [
            "UI component library",
            "A database",
            "A routing library",
            "A testing framework",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Input decorator?",
          options: [
            "To pass data from parent to child",
            "To pass data from child to parent",
            "To emit events",
            "To handle routing",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Output decorator?",
          options: [
            "To emit events from child to parent",
            "To receive data",
            "To handle routing",
            "To manage state",
          ],
          correctIndex: 0,
        },
      ],
      intermediate: [
        {
          question: "What are Angular Signals?",
          options: [
            "Reactive primitives for state management",
            "Database signals",
            "Routing signals",
            "CSS signals",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of computed() in Angular Signals?",
          options: [
            "To create derived reactive values",
            "To compute routes",
            "To compute services",
            "To compute components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is effect() in Angular Signals?",
          options: [
            "To perform side effects based on signal changes",
            "To create effects",
            "To handle routing",
            "To manage state",
          ],
          correctIndex: 0,
        },
        {
          question: "What is standalone components in Angular?",
          options: [
            "Components that don't require NgModule",
            "Components with no dependencies",
            "Components without templates",
            "Components without styles",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Angular SSR (Server-Side Rendering)?",
          options: [
            "Rendering Angular apps on the server",
            "Server routing",
            "Server services",
            "Server components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Angular Universal?",
          options: [
            "Framework for server-side rendering",
            "A database",
            "A component library",
            "A testing tool",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of TransferState?",
          options: [
            "To transfer state from server to client",
            "To transfer routes",
            "To transfer services",
            "To transfer components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Angular's dependency injection system?",
          options: [
            "A hierarchical DI system",
            "A flat DI system",
            "A global DI system",
            "A local DI system",
          ],
          correctIndex: 0,
        },
        {
          question: "What is providedIn: 'root'?",
          options: [
            "Service available app-wide as singleton",
            "Service in root component",
            "Service in root module",
            "Service in root route",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a custom pipe?",
          options: [
            "User-defined data transformation",
            "Built-in pipe",
            "Component pipe",
            "Service pipe",
          ],
          correctIndex: 0,
        },
        {
          question: "What is pure vs impure pipe?",
          options: [
            "Pure: only runs on input change; Impure: runs on every change detection",
            "Pure: runs always; Impure: runs sometimes",
            "Pure: for data; Impure: for UI",
            "Pure: for components; Impure: for services",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Angular's zone.js?",
          options: [
            "Library for change detection",
            "A database",
            "A component",
            "A service",
          ],
          correctIndex: 0,
        },
        {
          question: "What is NgZone?",
          options: [
            "Service to manage Angular zones",
            "A component",
            "A directive",
            "A pipe",
          ],
          correctIndex: 0,
        },
        {
          question: "What is trackBy function in *ngFor?",
          options: [
            "To optimize rendering by tracking items",
            "To track routes",
            "To track services",
            "To track components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Angular's animation system?",
          options: [
            "Built-in animation framework",
            "External animation library",
            "CSS-only animations",
            "JavaScript animations",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @HostBinding?",
          options: [
            "To bind to host element properties",
            "To bind to child properties",
            "To bind to parent properties",
            "To bind to service properties",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @HostListener?",
          options: [
            "To listen to host element events",
            "To listen to child events",
            "To listen to parent events",
            "To listen to service events",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Angular's i18n (internationalization)?",
          options: [
            "Support for multiple languages",
            "Internal routing",
            "Internal services",
            "Internal components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Angular's testability?",
          options: [
            "Built-in testing support",
            "External testing",
            "Manual testing",
            "No testing",
          ],
          correctIndex: 0,
        },
        {
          question: "What is TestBed in Angular testing?",
          options: [
            "Testing utility to configure testing module",
            "A test database",
            "A test component",
            "A test service",
          ],
          correctIndex: 0,
        },
      ],
    },
    React: {
      beginner: [
        {
          question: "What is React?",
          options: [
            "A JavaScript library for building user interfaces",
            "A database",
            "A CSS framework",
            "A programming language",
          ],
          correctIndex: 0,
        },
        {
          question: "Who created React?",
          options: ["Facebook (Meta)", "Google", "Microsoft", "Twitter"],
          correctIndex: 0,
        },
        {
          question: "What is JSX?",
          options: [
            "JavaScript syntax extension for writing HTML-like code",
            "A database query",
            "A CSS preprocessor",
            "A JavaScript framework",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a React component?",
          options: [
            "A reusable piece of UI",
            "A database table",
            "A CSS class",
            "A JavaScript function only",
          ],
          correctIndex: 0,
        },
        {
          question: "How do you create a functional component in React?",
          options: [
            "function ComponentName() { return ... }",
            "class ComponentName",
            "const ComponentName = () =>",
            "Both A and C",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of props in React?",
          options: [
            "To pass data from parent to child components",
            "To store component state",
            "To handle events",
            "To style components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is state in React?",
          options: [
            "Component's internal data that can change",
            "Props passed from parent",
            "External data",
            "CSS styles",
          ],
          correctIndex: 0,
        },
        {
          question:
            "Which hook is used to manage state in functional components?",
          options: ["useState", "useEffect", "useContext", "useReducer"],
          correctIndex: 0,
        },
        {
          question: "What does useState return?",
          options: [
            "An array with state value and setter function",
            "Just the state value",
            "Just the setter function",
            "An object",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of useEffect?",
          options: [
            "To perform side effects in functional components",
            "To manage state",
            "To pass props",
            "To create components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the virtual DOM?",
          options: [
            "A lightweight representation of the real DOM",
            "A database",
            "A CSS concept",
            "A JavaScript library",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React's reconciliation algorithm?",
          options: [
            "Process of updating the DOM efficiently",
            "A sorting algorithm",
            "A search algorithm",
            "A data structure",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a key prop used for?",
          options: [
            "To help React identify which items have changed",
            "To style elements",
            "To handle events",
            "To pass data",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the default export in React?",
          options: [
            "export default ComponentName",
            "export ComponentName",
            "module.exports = ComponentName",
            "exports.ComponentName",
          ],
          correctIndex: 0,
        },
        {
          question: "How do you render a list in React?",
          options: [
            "Using map() to create elements",
            "Using for loop",
            "Using while loop",
            "Using if statements",
          ],
          correctIndex: 0,
        },
        {
          question: "What is conditional rendering?",
          options: [
            "Rendering different UI based on conditions",
            "Rendering always",
            "Rendering never",
            "Rendering once",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of React.Fragment?",
          options: [
            "To group elements without adding extra DOM nodes",
            "To create fragments",
            "To split components",
            "To combine components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the shorthand for React.Fragment?",
          options: [
            "<> </>",
            "<Fragment> </Fragment>",
            "<div> </div>",
            "<span> </span>",
          ],
          correctIndex: 0,
        },
        {
          question: "What is event handling in React?",
          options: [
            "Handling user interactions with event handlers",
            "Handling database events",
            "Handling CSS events",
            "Handling server events",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of setState in class components?",
          options: [
            "To update component state",
            "To update props",
            "To update the DOM directly",
            "To update CSS",
          ],
          correctIndex: 0,
        },
      ],
      middle: [
        {
          question: "What are React Hooks?",
          options: [
            "Functions that let you use state and lifecycle in functional components",
            "CSS hooks",
            "Database hooks",
            "API hooks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of useContext?",
          options: [
            "To access context values",
            "To create context",
            "To update context",
            "To delete context",
          ],
          correctIndex: 0,
        },
        {
          question: "What is useReducer?",
          options: [
            "A hook for complex state logic",
            "A hook for effects",
            "A hook for context",
            "A hook for refs",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the dependency array in useEffect?",
          options: [
            "Array of values that trigger the effect when changed",
            "Array of components",
            "Array of props",
            "Array of states",
          ],
          correctIndex: 0,
        },
        {
          question:
            "What happens if you omit the dependency array in useEffect?",
          options: [
            "Effect runs on every render",
            "Effect runs once",
            "Effect never runs",
            "Effect runs on mount only",
          ],
          correctIndex: 0,
        },
        {
          question: "What is useMemo?",
          options: [
            "Hook to memoize expensive calculations",
            "Hook to memoize components",
            "Hook to memoize props",
            "Hook to memoize state",
          ],
          correctIndex: 0,
        },
        {
          question: "What is useCallback?",
          options: [
            "Hook to memoize callback functions",
            "Hook to create callbacks",
            "Hook to delete callbacks",
            "Hook to update callbacks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is useRef?",
          options: [
            "Hook to access DOM elements or persist values",
            "Hook to create refs",
            "Hook to delete refs",
            "Hook to update refs",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React Context?",
          options: [
            "A way to pass data through component tree without props",
            "A database context",
            "A CSS context",
            "A JavaScript context",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Higher-Order Component (HOC)?",
          options: [
            "A function that takes a component and returns a new component",
            "A component that is higher",
            "A component with higher state",
            "A component with higher props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Render Prop?",
          options: [
            "A pattern where a component receives a function as a prop",
            "A prop that renders",
            "A prop with render method",
            "A prop for rendering",
          ],
          correctIndex: 0,
        },
        {
          question: "What is code splitting in React?",
          options: [
            "Splitting code into smaller chunks loaded on demand",
            "Splitting components",
            "Splitting state",
            "Splitting props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React.lazy?",
          options: [
            "Function to lazy load components",
            "Function to lazy load state",
            "Function to lazy load props",
            "Function to lazy load CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Suspense in React?",
          options: [
            "Component to handle loading states",
            "Component to handle errors",
            "Component to handle state",
            "Component to handle props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is error boundary in React?",
          options: [
            "Component that catches JavaScript errors",
            "Component that catches CSS errors",
            "Component that catches API errors",
            "Component that catches all errors",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of React.memo?",
          options: [
            "To memoize functional components",
            "To memoize class components",
            "To memoize state",
            "To memoize props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is controlled component?",
          options: [
            "Component where form data is controlled by React state",
            "Component controlled by parent",
            "Component with controlled state",
            "Component with controlled props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is uncontrolled component?",
          options: [
            "Component where form data is handled by DOM",
            "Component not controlled by React",
            "Component without state",
            "Component without props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of React Router?",
          options: [
            "To handle routing in React applications",
            "To handle state",
            "To handle props",
            "To handle CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the difference between props and state?",
          options: [
            "Props are passed from parent, state is internal",
            "Props are internal, state is external",
            "No difference",
            "Props are for functions, state is for classes",
          ],
          correctIndex: 0,
        },
      ],
      intermediate: [
        {
          question: "What is React Server Components?",
          options: [
            "Components that render on the server",
            "Components on server",
            "Server-side components",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is Concurrent Mode in React?",
          options: [
            "Feature to make apps more responsive",
            "Mode for concurrent rendering",
            "Mode for parallel processing",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is useTransition?",
          options: [
            "Hook to mark state updates as transitions",
            "Hook for transitions",
            "Hook for animations",
            "Hook for routing",
          ],
          correctIndex: 0,
        },
        {
          question: "What is useDeferredValue?",
          options: [
            "Hook to defer updating a value",
            "Hook to defer state",
            "Hook to defer props",
            "Hook to defer rendering",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React's automatic batching?",
          options: [
            "Grouping multiple state updates into one re-render",
            "Batching API calls",
            "Batching components",
            "Batching props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a custom hook?",
          options: [
            "A function that uses other hooks to share logic",
            "A built-in hook",
            "A component hook",
            "A state hook",
          ],
          correctIndex: 0,
        },
        {
          question: "What are the rules of hooks?",
          options: [
            "Only call hooks at top level, only in React functions",
            "Call hooks anywhere",
            "Call hooks in loops",
            "Call hooks conditionally",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React Query (TanStack Query)?",
          options: [
            "Library for server state management",
            "Query language",
            "Database query",
            "API query",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Redux?",
          options: [
            "State management library",
            "Component library",
            "CSS library",
            "Database library",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Zustand?",
          options: [
            "Lightweight state management library",
            "Heavy state management",
            "Component library",
            "CSS library",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React Testing Library?",
          options: [
            "Library for testing React components",
            "Library for testing APIs",
            "Library for testing databases",
            "Library for testing CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Jest?",
          options: [
            "JavaScript testing framework",
            "CSS framework",
            "Component framework",
            "State framework",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React DevTools?",
          options: [
            "Browser extension for debugging React",
            "Development tool",
            "Debugging tool",
            "All of the above",
          ],
          correctIndex: 3,
        },
        {
          question: "What is the purpose of useImperativeHandle?",
          options: [
            "To customize the instance value exposed to parent components",
            "To customize state",
            "To customize props",
            "To customize rendering",
          ],
          correctIndex: 0,
        },
        {
          question: "What is useLayoutEffect?",
          options: [
            "Synchronous version of useEffect that runs before paint",
            "Asynchronous useEffect",
            "useEffect with layout",
            "useEffect for layouts",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React Portal?",
          options: [
            "Way to render children into DOM node outside parent hierarchy",
            "Way to render components",
            "Way to render state",
            "Way to render props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React's Profiler API?",
          options: [
            "To measure component rendering performance",
            "To profile state",
            "To profile props",
            "To profile CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is StrictMode in React?",
          options: [
            "Tool to highlight potential problems",
            "Mode for strict rendering",
            "Mode for strict state",
            "Mode for strict props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of React.cloneElement?",
          options: [
            "To clone and modify a React element",
            "To clone components",
            "To clone state",
            "To clone props",
          ],
          correctIndex: 0,
        },
        {
          question: "What is React's reconciliation process?",
          options: [
            "Algorithm to update DOM efficiently by comparing trees",
            "Process to reconcile state",
            "Process to reconcile props",
            "Process to reconcile components",
          ],
          correctIndex: 0,
        },
      ],
    },
    NextJS: {
      beginner: [
        {
          question: "What is Next.js?",
          options: [
            "React framework for production",
            "A database",
            "A CSS framework",
            "A JavaScript library",
          ],
          correctIndex: 0,
        },
        {
          question: "Who created Next.js?",
          options: ["Vercel", "Facebook", "Google", "Microsoft"],
          correctIndex: 0,
        },
        {
          question: "What is the main advantage of Next.js?",
          options: [
            "Server-side rendering and static site generation",
            "Better CSS",
            "Better database",
            "Better JavaScript",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Server-Side Rendering (SSR) in Next.js?",
          options: [
            "Rendering pages on the server",
            "Rendering on client",
            "Rendering in database",
            "Rendering in CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Static Site Generation (SSG)?",
          options: [
            "Pre-rendering pages at build time",
            "Rendering at runtime",
            "Rendering on demand",
            "Rendering dynamically",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the pages directory used for?",
          options: [
            "File-based routing system",
            "Component storage",
            "API storage",
            "Style storage",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the app directory in Next.js 13+?",
          options: [
            "New routing system with React Server Components",
            "Old routing system",
            "Component directory",
            "API directory",
          ],
          correctIndex: 0,
        },
        {
          question: "What is getStaticProps?",
          options: [
            "Function to fetch data at build time",
            "Function to fetch at runtime",
            "Function to fetch on client",
            "Function to fetch from API",
          ],
          correctIndex: 0,
        },
        {
          question: "What is getServerSideProps?",
          options: [
            "Function to fetch data on each request",
            "Function to fetch at build time",
            "Function to fetch on client",
            "Function to fetch from database",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of getStaticPaths?",
          options: [
            "To define dynamic routes for SSG",
            "To define static routes",
            "To define API routes",
            "To define component routes",
          ],
          correctIndex: 0,
        },
        {
          question: "What is API Routes in Next.js?",
          options: [
            "Serverless functions for backend logic",
            "Client-side routes",
            "Database routes",
            "CSS routes",
          ],
          correctIndex: 0,
        },
        {
          question: "Where are API routes defined in Next.js?",
          options: [
            "pages/api directory",
            "components/api",
            "lib/api",
            "utils/api",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Image Optimization in Next.js?",
          options: [
            "Automatic image optimization and lazy loading",
            "Manual image optimization",
            "CSS image optimization",
            "JavaScript image optimization",
          ],
          correctIndex: 0,
        },
        {
          question: "What component is used for optimized images?",
          options: ["next/image", "img", "Image", "NextImage"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/link?",
          options: [
            "Client-side navigation with prefetching",
            "Server-side navigation",
            "External navigation",
            "API navigation",
          ],
          correctIndex: 0,
        },
        {
          question: "What is code splitting in Next.js?",
          options: [
            "Automatic code splitting for optimal performance",
            "Manual code splitting",
            "No code splitting",
            "Full code loading",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the _app.js file used for?",
          options: [
            "Custom App component to initialize pages",
            "Main app component",
            "API component",
            "Style component",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the _document.js file used for?",
          options: [
            "Custom Document to modify HTML structure",
            "Custom document component",
            "API document",
            "Style document",
          ],
          correctIndex: 0,
        },
        {
          question: "What is environment variables in Next.js?",
          options: [
            "Variables accessible in server and client",
            "Only server variables",
            "Only client variables",
            "No variables",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next.config.js?",
          options: [
            "Configuration file for Next.js",
            "Component config",
            "API config",
            "Style config",
          ],
          correctIndex: 0,
        },
      ],
      middle: [
        {
          question: "What is Incremental Static Regeneration (ISR)?",
          options: [
            "Update static pages after build without rebuilding",
            "Rebuild all pages",
            "No updates",
            "Manual updates",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the revalidate option in getStaticProps?",
          options: [
            "Time in seconds to regenerate page",
            "Time to cache",
            "Time to expire",
            "Time to build",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Dynamic Routes in Next.js?",
          options: [
            "Routes with parameters like [id]",
            "Static routes",
            "API routes",
            "Component routes",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Catch-all Routes?",
          options: [
            "Routes that match multiple segments like [...slug]",
            "Single segment routes",
            "No segment routes",
            "Fixed routes",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Optional Catch-all Routes?",
          options: [
            "Routes with optional segments like [[...slug]]",
            "Required segments",
            "No segments",
            "Fixed segments",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Middleware in Next.js?",
          options: [
            "Code that runs before a request is completed",
            "Code after request",
            "Code during request",
            "Code before response",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/head?",
          options: [
            "To modify the head section of HTML",
            "To modify body",
            "To modify scripts",
            "To modify styles",
          ],
          correctIndex: 0,
        },
        {
          question: "What is next/script?",
          options: [
            "Optimized script loading component",
            "Regular script tag",
            "Inline script",
            "External script",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/router?",
          options: [
            "Programmatic navigation and route information",
            "Component router",
            "API router",
            "Style router",
          ],
          correctIndex: 0,
        },
        {
          question: "What is getInitialProps?",
          options: [
            "Legacy method to fetch data (deprecated)",
            "Current method",
            "Future method",
            "Alternative method",
          ],
          correctIndex: 0,
        },
        {
          question: "What is SWC in Next.js?",
          options: [
            "Rust-based compiler for faster builds",
            "JavaScript compiler",
            "TypeScript compiler",
            "CSS compiler",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/font?",
          options: [
            "Automatic font optimization",
            "Manual font loading",
            "No font optimization",
            "External font loading",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Edge Runtime in Next.js?",
          options: [
            "Lightweight runtime for edge functions",
            "Full Node.js runtime",
            "Browser runtime",
            "Server runtime",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/dynamic?",
          options: [
            "Dynamic imports with code splitting",
            "Static imports",
            "No imports",
            "Full imports",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Preview Mode in Next.js?",
          options: [
            "Bypass static generation for preview",
            "Static generation only",
            "No generation",
            "Full generation",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/amp?",
          options: [
            "To create AMP pages",
            "To create regular pages",
            "To create API pages",
            "To create component pages",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Internationalization (i18n) in Next.js?",
          options: [
            "Built-in support for multiple languages",
            "External support",
            "No support",
            "Manual support",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/error?",
          options: [
            "Custom error pages",
            "Default error pages",
            "No error pages",
            "API error pages",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/analytics?",
          options: [
            "Built-in analytics support",
            "External analytics",
            "No analytics",
            "Manual analytics",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the difference between pages and app directory?",
          options: [
            "App uses React Server Components and new routing",
            "No difference",
            "Pages is newer",
            "App is older",
          ],
          correctIndex: 0,
        },
      ],
      intermediate: [
        {
          question: "What are React Server Components in Next.js 13+?",
          options: [
            "Components that render on the server",
            "Components on client",
            "Components in database",
            "Components in CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of 'use client' directive?",
          options: [
            "To mark component as client component",
            "To mark as server",
            "To mark as static",
            "To mark as dynamic",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Streaming SSR in Next.js?",
          options: [
            "Progressive rendering of page chunks",
            "Full page rendering",
            "No rendering",
            "Static rendering",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Suspense Boundaries in Next.js?",
          options: [
            "To handle loading states for components",
            "To handle errors",
            "To handle routing",
            "To handle API calls",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of generateMetadata?",
          options: [
            "To generate metadata for pages",
            "To generate components",
            "To generate APIs",
            "To generate styles",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Route Handlers in App Router?",
          options: [
            "API routes in app directory",
            "Component routes",
            "Static routes",
            "Dynamic routes",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of generateStaticParams?",
          options: [
            "To generate static params for dynamic routes",
            "To generate dynamic params",
            "To generate API params",
            "To generate component params",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Partial Prerendering in Next.js?",
          options: [
            "Hybrid rendering with static and dynamic parts",
            "Full static",
            "Full dynamic",
            "No rendering",
          ],
          correctIndex: 0,
        },
        {
          question:
            "What is the purpose of next.config.js experimental features?",
          options: [
            "To enable experimental Next.js features",
            "To disable features",
            "To test features",
            "To remove features",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Turbopack in Next.js?",
          options: [
            "Next-generation bundler for faster dev experience",
            "Old bundler",
            "No bundler",
            "External bundler",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/image layout prop?",
          options: [
            "To control image layout behavior",
            "To control size",
            "To control quality",
            "To control format",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of next/image placeholder?",
          options: [
            "To show placeholder while loading",
            "To show error",
            "To show nothing",
            "To show full image",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of rewrites in next.config.js?",
          options: [
            "To rewrite URLs internally",
            "To rewrite components",
            "To rewrite APIs",
            "To rewrite styles",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of redirects in next.config.js?",
          options: [
            "To redirect URLs",
            "To redirect components",
            "To redirect APIs",
            "To redirect styles",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of headers in next.config.js?",
          options: [
            "To set custom HTTP headers",
            "To set component headers",
            "To set API headers",
            "To set style headers",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of webpack configuration in Next.js?",
          options: [
            "To customize webpack build process",
            "To customize components",
            "To customize APIs",
            "To customize styles",
          ],
          correctIndex: 0,
        },
        {
          question:
            "What is the purpose of output: 'standalone' in next.config.js?",
          options: [
            "To create standalone serverless deployment",
            "To create full deployment",
            "To create partial deployment",
            "To create no deployment",
          ],
          correctIndex: 0,
        },
        {
          question:
            "What is the purpose of output: 'export' in next.config.js?",
          options: [
            "To export static HTML",
            "To export dynamic HTML",
            "To export API",
            "To export components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of optimizeFonts in next.config.js?",
          options: [
            "To optimize font loading",
            "To optimize images",
            "To optimize APIs",
            "To optimize components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of reactStrictMode in next.config.js?",
          options: [
            "To enable React Strict Mode",
            "To disable Strict Mode",
            "To test Strict Mode",
            "To remove Strict Mode",
          ],
          correctIndex: 0,
        },
      ],
    },
    NestJS: {
      beginner: [
        {
          question: "What is NestJS?",
          options: [
            "A progressive Node.js framework",
            "A database",
            "A CSS framework",
            "A JavaScript library",
          ],
          correctIndex: 0,
        },
        {
          question: "What is NestJS built on top of?",
          options: ["Express.js (or Fastify)", "React", "Angular", "Vue"],
          correctIndex: 0,
        },
        {
          question: "What programming language does NestJS use?",
          options: ["TypeScript", "JavaScript only", "Python", "Java"],
          correctIndex: 0,
        },
        {
          question: "What is a Module in NestJS?",
          options: [
            "A class decorated with @Module()",
            "A JavaScript file",
            "A database table",
            "A CSS file",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Controller in NestJS?",
          options: [
            "Handles incoming requests and returns responses",
            "Handles database",
            "Handles CSS",
            "Handles JavaScript",
          ],
          correctIndex: 0,
        },
        {
          question: "What decorator is used to define a controller?",
          options: ["@Controller()", "@Component()", "@Service()", "@Module()"],
          correctIndex: 0,
        },
        {
          question: "What is a Service in NestJS?",
          options: [
            "A class that provides business logic",
            "A database service",
            "A CSS service",
            "A JavaScript service",
          ],
          correctIndex: 0,
        },
        {
          question: "What decorator is used to define a service?",
          options: [
            "@Injectable()",
            "@Service()",
            "@Provider()",
            "@Component()",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Dependency Injection in NestJS?",
          options: [
            "Design pattern to provide dependencies",
            "Database injection",
            "CSS injection",
            "JavaScript injection",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the root module in NestJS?",
          options: ["AppModule", "RootModule", "MainModule", "CoreModule"],
          correctIndex: 0,
        },
        {
          question: "What decorator is used for GET requests?",
          options: ["@Get()", "@Post()", "@Put()", "@Delete()"],
          correctIndex: 0,
        },
        {
          question: "What decorator is used for POST requests?",
          options: ["@Post()", "@Get()", "@Put()", "@Delete()"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Body() decorator?",
          options: [
            "To extract request body",
            "To extract headers",
            "To extract params",
            "To extract query",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Param() decorator?",
          options: [
            "To extract route parameters",
            "To extract body",
            "To extract headers",
            "To extract query",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Query() decorator?",
          options: [
            "To extract query parameters",
            "To extract body",
            "To extract headers",
            "To extract params",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Provider in NestJS?",
          options: [
            "A class that can be injected as a dependency",
            "A database provider",
            "A CSS provider",
            "A JavaScript provider",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of imports array in @Module()?",
          options: [
            "To import other modules",
            "To import components",
            "To import services",
            "To import controllers",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of providers array in @Module()?",
          options: [
            "To provide services to the module",
            "To provide controllers",
            "To provide modules",
            "To provide components",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of controllers array in @Module()?",
          options: [
            "To register controllers",
            "To register services",
            "To register modules",
            "To register components",
          ],
          correctIndex: 0,
        },
        {
          question: "What command is used to create a new NestJS project?",
          options: [
            "nest new",
            "nest create",
            "npm create nest",
            "create-nest",
          ],
          correctIndex: 0,
        },
      ],
      middle: [
        {
          question: "What is a Guard in NestJS?",
          options: [
            "Determines whether a request should be handled",
            "Guards database",
            "Guards CSS",
            "Guards JavaScript",
          ],
          correctIndex: 0,
        },
        {
          question: "What decorator is used to create a guard?",
          options: [
            "@Injectable() with CanActivate interface",
            "@Guard()",
            "@CanActivate()",
            "@Protect()",
          ],
          correctIndex: 0,
        },
        {
          question: "What is an Interceptor in NestJS?",
          options: [
            "A class that intercepts requests/responses",
            "A database interceptor",
            "A CSS interceptor",
            "A JavaScript interceptor",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Pipe in NestJS?",
          options: [
            "Transforms or validates input data",
            "Transforms database",
            "Transforms CSS",
            "Transforms JavaScript",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Middleware in NestJS?",
          options: [
            "Functions executed before route handlers",
            "Functions after handlers",
            "Functions during handlers",
            "Functions before responses",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Exception Filter in NestJS?",
          options: [
            "Catches exceptions and returns formatted responses",
            "Catches database errors",
            "Catches CSS errors",
            "Catches JavaScript errors",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @UseGuards()?",
          options: [
            "To apply guards to routes",
            "To apply pipes",
            "To apply interceptors",
            "To apply filters",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @UsePipes()?",
          options: [
            "To apply pipes to routes",
            "To apply guards",
            "To apply interceptors",
            "To apply filters",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @UseInterceptors()?",
          options: [
            "To apply interceptors to routes",
            "To apply guards",
            "To apply pipes",
            "To apply filters",
          ],
          correctIndex: 0,
        },
        {
          question: "What is ValidationPipe in NestJS?",
          options: [
            "Built-in pipe for validation",
            "Custom validation",
            "Database validation",
            "CSS validation",
          ],
          correctIndex: 0,
        },
        {
          question: "What library does NestJS use for validation?",
          options: ["class-validator", "joi", "yup", "zod"],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @IsString() decorator?",
          options: [
            "To validate string type",
            "To validate number",
            "To validate boolean",
            "To validate array",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @IsNotEmpty() decorator?",
          options: [
            "To ensure value is not empty",
            "To ensure value is empty",
            "To ensure value is null",
            "To ensure value is undefined",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a DTO (Data Transfer Object)?",
          options: [
            "Object that defines data structure",
            "Database object",
            "CSS object",
            "JavaScript object",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Transform() decorator?",
          options: [
            "To transform data before validation",
            "To transform after validation",
            "To transform database",
            "To transform CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Exclude() decorator?",
          options: [
            "To exclude properties from serialization",
            "To include properties",
            "To delete properties",
            "To add properties",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Expose() decorator?",
          options: [
            "To include properties in serialization",
            "To exclude properties",
            "To delete properties",
            "To hide properties",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Custom Decorator in NestJS?",
          options: [
            "User-defined decorator for metadata",
            "Built-in decorator",
            "Database decorator",
            "CSS decorator",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @SetMetadata()?",
          options: [
            "To attach metadata to handlers",
            "To remove metadata",
            "To update metadata",
            "To delete metadata",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of Reflector in NestJS?",
          options: [
            "To retrieve metadata",
            "To set metadata",
            "To delete metadata",
            "To update metadata",
          ],
          correctIndex: 0,
        },
      ],
      intermediate: [
        {
          question: "What is Dynamic Module in NestJS?",
          options: [
            "Module that can be configured at runtime",
            "Static module",
            "Fixed module",
            "Constant module",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of forRoot() in modules?",
          options: [
            "To configure module with options",
            "To configure without options",
            "To delete configuration",
            "To update configuration",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of forFeature() in modules?",
          options: [
            "To register feature-specific providers",
            "To register global providers",
            "To delete providers",
            "To update providers",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Async Module in NestJS?",
          options: [
            "Module that can be configured asynchronously",
            "Synchronous module",
            "Static module",
            "Fixed module",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of useFactory in providers?",
          options: [
            "To create provider instance dynamically",
            "To create statically",
            "To delete provider",
            "To update provider",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of useClass in providers?",
          options: [
            "To use a class as provider",
            "To use a value",
            "To use a factory",
            "To use a function",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of useValue in providers?",
          options: [
            "To provide a constant value",
            "To provide a class",
            "To provide a factory",
            "To provide a function",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Scope in NestJS providers?",
          options: [
            "Lifetime of provider instance",
            "Provider location",
            "Provider type",
            "Provider name",
          ],
          correctIndex: 0,
        },
        {
          question: "What are the provider scopes in NestJS?",
          options: [
            "DEFAULT, REQUEST, TRANSIENT",
            "PUBLIC, PRIVATE",
            "GLOBAL, LOCAL",
            "STATIC, DYNAMIC",
          ],
          correctIndex: 0,
        },
        {
          question: "What is REQUEST scope in NestJS?",
          options: [
            "New instance per request",
            "Single instance",
            "No instance",
            "Shared instance",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Event Emitter in NestJS?",
          options: [
            "Module for event-driven architecture",
            "Database emitter",
            "CSS emitter",
            "JavaScript emitter",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @OnEvent() decorator?",
          options: [
            "To listen to events",
            "To emit events",
            "To delete events",
            "To update events",
          ],
          correctIndex: 0,
        },
        {
          question:
            "What is CQRS (Command Query Responsibility Segregation) in NestJS?",
          options: [
            "Pattern to separate read and write operations",
            "Pattern to combine operations",
            "Pattern to delete operations",
            "Pattern to update operations",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Microservices in NestJS?",
          options: [
            "Architecture pattern for distributed systems",
            "Single service",
            "Database service",
            "CSS service",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @MessagePattern()?",
          options: [
            "To handle messages in microservices",
            "To handle HTTP requests",
            "To handle database queries",
            "To handle CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is GraphQL in NestJS?",
          options: [
            "Query language and runtime for APIs",
            "Database language",
            "CSS language",
            "JavaScript language",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Query() in GraphQL?",
          options: [
            "To define GraphQL query resolver",
            "To define mutation",
            "To define subscription",
            "To define type",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @Mutation() in GraphQL?",
          options: [
            "To define GraphQL mutation resolver",
            "To define query",
            "To define subscription",
            "To define type",
          ],
          correctIndex: 0,
        },
        {
          question: "What is WebSocket in NestJS?",
          options: [
            "Real-time bidirectional communication",
            "One-way communication",
            "No communication",
            "Static communication",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of @WebSocketGateway()?",
          options: [
            "To create WebSocket gateway",
            "To create HTTP gateway",
            "To create database gateway",
            "To create CSS gateway",
          ],
          correctIndex: 0,
        },
      ],
    },
    NodeJS: {
      beginner: [
        {
          question: "What is Node.js?",
          options: [
            "JavaScript runtime built on Chrome's V8 engine",
            "A database",
            "A CSS framework",
            "A JavaScript library",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the main advantage of Node.js?",
          options: [
            "Non-blocking, event-driven I/O",
            "Blocking I/O",
            "Synchronous operations",
            "Single-threaded only",
          ],
          correctIndex: 0,
        },
        {
          question: "What is npm?",
          options: [
            "Node Package Manager",
            "Node Program Manager",
            "Node Process Manager",
            "Node Project Manager",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of package.json?",
          options: [
            "To define project metadata and dependencies",
            "To define database",
            "To define CSS",
            "To define JavaScript",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the CommonJS module system?",
          options: [
            "Module system using require() and module.exports",
            "ES6 modules",
            "AMD modules",
            "UMD modules",
          ],
          correctIndex: 0,
        },
        {
          question: "What is require() used for?",
          options: [
            "To import modules",
            "To export modules",
            "To delete modules",
            "To update modules",
          ],
          correctIndex: 0,
        },
        {
          question: "What is module.exports used for?",
          options: [
            "To export modules",
            "To import modules",
            "To delete modules",
            "To update modules",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the Event Loop in Node.js?",
          options: [
            "Mechanism that handles asynchronous operations",
            "Synchronous loop",
            "Database loop",
            "CSS loop",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a callback function?",
          options: [
            "Function passed as argument to be called later",
            "Function that calls itself",
            "Function that returns immediately",
            "Function with no parameters",
          ],
          correctIndex: 0,
        },
        {
          question: "What is callback hell?",
          options: [
            "Nested callbacks making code hard to read",
            "Fast callbacks",
            "Slow callbacks",
            "No callbacks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Promise in Node.js?",
          options: [
            "Object representing eventual completion of async operation",
            "Synchronous operation",
            "Database operation",
            "CSS operation",
          ],
          correctIndex: 0,
        },
        {
          question: "What is async/await?",
          options: [
            "Syntactic sugar for Promises",
            "Callback syntax",
            "Synchronous syntax",
            "Database syntax",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the fs module used for?",
          options: [
            "File system operations",
            "Database operations",
            "Network operations",
            "CSS operations",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the path module used for?",
          options: [
            "To handle file and directory paths",
            "To handle databases",
            "To handle networks",
            "To handle CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the http module used for?",
          options: [
            "To create HTTP servers and clients",
            "To create databases",
            "To create files",
            "To create CSS",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Express.js?",
          options: [
            "Web application framework for Node.js",
            "Database framework",
            "CSS framework",
            "JavaScript framework",
          ],
          correctIndex: 0,
        },
        {
          question: "What is middleware in Express?",
          options: [
            "Functions that execute during request-response cycle",
            "Functions before request",
            "Functions after response",
            "Functions outside cycle",
          ],
          correctIndex: 0,
        },
        {
          question: "What is process.env?",
          options: [
            "Object containing environment variables",
            "Object containing process variables",
            "Object containing system variables",
            "Object containing user variables",
          ],
          correctIndex: 0,
        },
        {
          question: "What is __dirname in Node.js?",
          options: [
            "Directory name of current module",
            "File name",
            "Module name",
            "Package name",
          ],
          correctIndex: 0,
        },
        {
          question: "What is __filename in Node.js?",
          options: [
            "File name of current module",
            "Directory name",
            "Module name",
            "Package name",
          ],
          correctIndex: 0,
        },
      ],
      middle: [
        {
          question: "What is the purpose of process.nextTick()?",
          options: [
            "To schedule callback before event loop continues",
            "To schedule after event loop",
            "To schedule immediately",
            "To schedule never",
          ],
          correctIndex: 0,
        },
        {
          question: "What is setImmediate()?",
          options: [
            "To execute callback on next iteration of event loop",
            "To execute immediately",
            "To execute after timeout",
            "To execute never",
          ],
          correctIndex: 0,
        },
        {
          question:
            "What is the difference between setImmediate() and process.nextTick()?",
          options: [
            "nextTick has higher priority",
            "setImmediate has higher priority",
            "Same priority",
            "No difference",
          ],
          correctIndex: 0,
        },
        {
          question: "What is a Stream in Node.js?",
          options: [
            "Abstract interface for working with streaming data",
            "Static data",
            "Database data",
            "CSS data",
          ],
          correctIndex: 0,
        },
        {
          question: "What are the types of streams?",
          options: [
            "Readable, Writable, Duplex, Transform",
            "Input, Output",
            "Source, Destination",
            "Read, Write",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of pipe()?",
          options: [
            "To connect readable and writable streams",
            "To disconnect streams",
            "To create streams",
            "To delete streams",
          ],
          correctIndex: 0,
        },
        {
          question: "What is Buffer in Node.js?",
          options: [
            "Class to handle binary data",
            "Class to handle text",
            "Class to handle JSON",
            "Class to handle XML",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of crypto module?",
          options: [
            "To provide cryptographic functionality",
            "To provide database functionality",
            "To provide file functionality",
            "To provide network functionality",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of util module?",
          options: [
            "To provide utility functions",
            "To provide database functions",
            "To provide file functions",
            "To provide network functions",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of events module?",
          options: [
            "To handle events using EventEmitter",
            "To handle files",
            "To handle databases",
            "To handle networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is EventEmitter?",
          options: [
            "Class for handling events",
            "Class for handling files",
            "Class for handling databases",
            "Class for handling networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of child_process module?",
          options: [
            "To spawn child processes",
            "To spawn parent processes",
            "To spawn main processes",
            "To spawn no processes",
          ],
          correctIndex: 0,
        },
        {
          question: "What is spawn() in child_process?",
          options: [
            "To spawn new process",
            "To kill process",
            "To pause process",
            "To resume process",
          ],
          correctIndex: 0,
        },
        {
          question: "What is exec() in child_process?",
          options: [
            "To execute command in shell",
            "To execute in Node",
            "To execute in browser",
            "To execute in database",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of cluster module?",
          options: [
            "To create child processes that share server ports",
            "To create single process",
            "To create no processes",
            "To create multiple servers",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of worker_threads module?",
          options: [
            "To run JavaScript in parallel using threads",
            "To run sequentially",
            "To run in single thread",
            "To run in main thread",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of os module?",
          options: [
            "To provide operating system utilities",
            "To provide database utilities",
            "To provide file utilities",
            "To provide network utilities",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of url module?",
          options: [
            "To parse and format URLs",
            "To parse files",
            "To parse databases",
            "To parse networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of querystring module?",
          options: [
            "To parse and format query strings",
            "To parse files",
            "To parse databases",
            "To parse networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of zlib module?",
          options: [
            "To provide compression and decompression",
            "To provide encryption",
            "To provide hashing",
            "To provide encoding",
          ],
          correctIndex: 0,
        },
      ],
      intermediate: [
        {
          question: "What is the purpose of worker_threads in Node.js?",
          options: [
            "To enable true parallelism with threads",
            "To enable single threading",
            "To enable no threading",
            "To enable main threading",
          ],
          correctIndex: 0,
        },
        {
          question:
            "What is the difference between cluster and worker_threads?",
          options: [
            "Cluster uses processes, worker_threads uses threads",
            "Same thing",
            "Cluster uses threads",
            "worker_threads uses processes",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of AsyncLocalStorage?",
          options: [
            "To store context across async operations",
            "To store files",
            "To store databases",
            "To store networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of AbortController?",
          options: [
            "To cancel async operations",
            "To start operations",
            "To pause operations",
            "To resume operations",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of performance hooks?",
          options: [
            "To measure performance of Node.js operations",
            "To measure files",
            "To measure databases",
            "To measure networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of vm module?",
          options: [
            "To compile and run JavaScript in V8 context",
            "To compile CSS",
            "To compile HTML",
            "To compile JSON",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of inspector module?",
          options: [
            "To enable debugging with Chrome DevTools",
            "To enable production",
            "To enable testing",
            "To enable building",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of readline module?",
          options: [
            "To read data from readable stream line by line",
            "To read files",
            "To read databases",
            "To read networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of repl module?",
          options: [
            "To create Read-Eval-Print-Loop interface",
            "To create files",
            "To create databases",
            "To create networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of assert module?",
          options: [
            "To provide assertion testing",
            "To provide files",
            "To provide databases",
            "To provide networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of test runner in Node.js?",
          options: [
            "Built-in test runner for running tests",
            "External test runner",
            "No test runner",
            "Manual test runner",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of --experimental-loader?",
          options: [
            "To customize module loading",
            "To customize files",
            "To customize databases",
            "To customize networks",
          ],
          correctIndex: 0,
        },
        {
          question:
            "What is the purpose of --experimental-specifier-resolution?",
          options: [
            "To customize module resolution",
            "To customize files",
            "To customize databases",
            "To customize networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of --loader?",
          options: [
            "To specify custom loader",
            "To specify files",
            "To specify databases",
            "To specify networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of --no-warnings?",
          options: [
            "To suppress warnings",
            "To show warnings",
            "To create warnings",
            "To delete warnings",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of --trace-warnings?",
          options: [
            "To print stack traces for warnings",
            "To hide warnings",
            "To create warnings",
            "To delete warnings",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of --max-old-space-size?",
          options: [
            "To set max memory for V8 heap",
            "To set max files",
            "To set max databases",
            "To set max networks",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of --inspect?",
          options: [
            "To enable inspector for debugging",
            "To disable inspector",
            "To create inspector",
            "To delete inspector",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of --experimental-modules?",
          options: [
            "To enable ES modules (legacy flag)",
            "To disable modules",
            "To create modules",
            "To delete modules",
          ],
          correctIndex: 0,
        },
        {
          question: "What is the purpose of --input-type=module?",
          options: [
            "To treat input as ES module",
            "To treat as CommonJS",
            "To treat as JSON",
            "To treat as text",
          ],
          correctIndex: 0,
        },
      ],
    },
  };

  // Get templates for the subject and level
  const templates = questionTemplates[subject]?.[level] || [];

  // If we have templates, use them (shuffled and repeated if needed)
  if (templates.length > 0) {
    // Shuffle templates
    const shuffled = [...templates].sort(() => Math.random() - 0.5);

    // Repeat templates to reach count
    for (let i = 0; i < count; i++) {
      const template = shuffled[i % shuffled.length];
      const questionNum = i + 1;

      questions.push({
        text: `${template.question} (Quiz Question ${questionNum})`,
        type: "mcq",
        options: template.options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === template.correctIndex,
        })),
      });
    }
  } else {
    // Fallback: Generate generic questions
    for (let i = 1; i <= count; i++) {
      const correctIndex = i % 4;
      questions.push({
        text: `(${level}) ${subject} question #${i}`,
        type: "mcq",
        options: [
          { text: `Option A for question ${i}`, isCorrect: correctIndex === 0 },
          { text: `Option B for question ${i}`, isCorrect: correctIndex === 1 },
          { text: `Option C for question ${i}`, isCorrect: correctIndex === 2 },
          { text: `Option D for question ${i}`, isCorrect: correctIndex === 3 },
        ],
      });
    }
  }

  return questions;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const subjectsService = app.get(SubjectsService);
  const quizzesService = app.get(QuizzesService);
  const usersService = app.get(UsersService);

  // Get models
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const quizModel = app.get(getModelToken("Quiz"));
  const questionModel = app.get(getModelToken("Question"));
  const optionModel = app.get(getModelToken("AnswerOption"));

  console.log("🌱 Starting database seed...\n");

  // Create or get admin user
  let adminUser = await userModel.findOne({ email: "admin@quiz.com" });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    adminUser = await userModel.create({
      name: "Admin User",
      email: "admin@quiz.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      totalPoints: 0,
    });
    console.log("✅ Created admin user");
  } else {
    console.log("✅ Admin user already exists");
  }

  // Create subjects
  const subjectMap = new Map();
  for (const subjectName of Object.values(SubjectName)) {
    const allSubjects = await subjectsService.findAll();
    let subject = allSubjects.find((s) => s.name === subjectName);
    if (!subject) {
      subject = await subjectsService.create({
        name: subjectName,
        description: `${subjectName} subject`,
      });
    }
    subjectMap.set(subjectName, subject);
    console.log(`✅ Subject: ${subjectName}`);
  }

  // Clear existing quizzes, questions, and options
  await optionModel.deleteMany({}).exec();
  await questionModel.deleteMany({}).exec();
  await quizModel.deleteMany({}).exec();
  console.log("✅ Cleared existing quizzes, questions, and options\n");

  // Generate 5 quizzes per level per subject
  const subjects = Object.values(SubjectName);
  const levels = Object.values(QuizLevel);
  let totalQuizzes = 0;
  let totalQuestions = 0;

  for (const subjectName of subjects) {
    const subject = subjectMap.get(subjectName);
    if (!subject) {
      console.log(`⚠️  Subject not found: ${subjectName}`);
      continue;
    }

    for (const level of levels) {
      // Create 5 quizzes for this subject/level combination
      for (let quizNum = 1; quizNum <= 5; quizNum++) {
        // Generate 20 random questions for this quiz
        const questions = generateAIQuestions(subjectName, level, 20);

        const quizTitle = `${subjectName} ${level.charAt(0).toUpperCase() + level.slice(1)} Quiz ${quizNum}`;

        try {
          await quizzesService.create(
            {
              subjectId: subject._id.toString(),
              level: level as QuizLevel,
              title: quizTitle,
              questions: questions,
              timerMinutes: 20, // 20-minute timer
            },
            adminUser
          );

          totalQuizzes++;
          totalQuestions += questions.length;
          console.log(
            `✅ Created: ${quizTitle} (${questions.length} questions)`
          );
        } catch (error) {
          console.error(`❌ Error creating quiz ${quizTitle}:`, error);
        }
      }
    }
  }

  console.log(`\n🎉 Seed completed!`);
  console.log(`   📊 Total Quizzes: ${totalQuizzes}`);
  console.log(`   ❓ Total Questions: ${totalQuestions}`);
  console.log(`   ⏱️  Timer: 20 minutes per quiz`);
  console.log(`   📚 Subjects: ${subjects.length}`);
  console.log(`   📈 Levels: ${levels.length}`);
  console.log(`   🎯 Quizzes per subject/level: 5\n`);

  await app.close();
}

bootstrap().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});

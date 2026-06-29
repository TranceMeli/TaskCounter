# Task Counter App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A minimal task counter app built with vanilla web technologies. Count tasks by
drawing tally marks on a canvas or using the +/- buttons, then save them to
named lists.

## Features

- Draw tally marks on an HTML5 canvas to count tasks
- Manual +1 / -1 buttons
- Create multiple named lists
- Add, edit, and delete tasks per list
- Responsive layout — stacks vertically on mobile
- No frameworks, no dependencies

## Project structure

```
task-counter/
├── index.html
├── style.css
└── app.js
```

## Getting started

Clone the repo and open `index.html` directly in your browser — no build step
required.

```bash
git clone https://github.com/TranceMeli/task-counter.git
cd task-counter
open index.html
```

## Usage

1. Set a count using the canvas or the +/- buttons
2. Type a task name in the input field
3. Select a list or create a new one with **+ New List**
4. Click **Add** to save the task to the list
5. Use **Edit** or **Delete** to manage existing tasks

## Color scheme

Uses the *Slate & sky* palette — a clean light mode theme with deep blue
(`#1D4ED8`) as the primary color and amber (`#F59E0B`) as the accent.

## License

[MIT](LICENSE)
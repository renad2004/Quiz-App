const form = document.querySelector("form");
const categoryMenu = document.querySelector("#categoryMenu");
const difficultyOptions = document.querySelector("#difficultyOptions");
const questionsNumber = document.querySelector("#questionsNumber");
const myRow = document.querySelector(".row");

let myQuiz;
let AllQuestions = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let category = categoryMenu.value;
  let difficulty = difficultyOptions.value;
  let numberOfQuestions = questionsNumber.value;

  if (!category || !difficulty || !numberOfQuestions) {
    alert("Please fill in all fields before starting.");
    return;
  }

  myQuiz = new Quiz(category, difficulty, numberOfQuestions);
  AllQuestions = await myQuiz.getAllQuestions();

  form.classList.replace("d-flex", "d-none");
  new Question(0, AllQuestions).displayQuestion();
});

class Quiz {
  constructor(category, difficulty, questionsNumber) {
    this.category = category;
    this.difficulty = difficulty;
    this.questionsNumber = questionsNumber;
    this.score = 0;
  }

  getApi() {
    return `https://opentdb.com/api.php?amount=${this.questionsNumber}&category=${this.category}&difficulty=${this.difficulty}`;
  }

  async getAllQuestions() {
    const response = await fetch(this.getApi());
    const data = await response.json();
    return data.results;
  }
}

class Question {
  constructor(index, questionsList) {
    this.index = index;
    this.questionsList = questionsList;
    this.question = questionsList[index].question;
    this.inanswers = questionsList[index].incorrect_answers;
    this.correctAnswer = questionsList[index].correct_answer;
    this.category = questionsList[index].category;
    this.Allanswers = this.shuffleAnswers([...this.inanswers, this.correctAnswer]);
  }

  shuffleAnswers(answers) {
    for (let i = answers.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  }

  displayQuestion() {
    const questionMarkUp = `
      <div
        class="question shadow-lg col-lg-6 offset-lg-3  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3 animate__animated animate__bounceIn"
      >
        <div class="w-100 d-flex justify-content-between">
          <span class="btn btn-category">${this.category}</span>
          <span class="fs-6 btn btn-questions"> ${this.index + 1} of ${this.questionsList.length} Questions</span>
        </div>
        <h2 class="text-capitalize h4 text-center">${this.question}</h2>  
        <ul class="choices w-100 list-unstyled m-0 d-flex flex-wrap text-center">
          ${this.Allanswers.map((answer) => `<li class="btn btn-answers">${answer}</li>`).join("")}
        </ul>
        <h2 class="text-capitalize text-center score-color h3 fw-bold">
          <i class="bi bi-emoji-laughing"></i> Score: ${myQuiz.score}
        </h2>        
      </div>
    `;

    myRow.innerHTML = questionMarkUp;

    const allChoices = document.querySelectorAll('.choices li');
    allChoices.forEach(choice => {
      choice.addEventListener("click", () => {
          allChoices.forEach(c => c.style.pointerEvents = "none");

        if (choice.innerHTML === this.correctAnswer) {
          choice.classList.add("correct", "animate__animated", "animate__bounce");
          myQuiz.score++;
        } else {
          choice.classList.add("wrong", "animate__animated", "animate__shakeX");

           allChoices.forEach(c => {
            if (c.innerHTML === this.correctAnswer) {
              c.classList.add("correct");
            }
          });
        }

         setTimeout(() => {
          if (this.index + 1 < this.questionsList.length) {
            new Question(this.index + 1, this.questionsList).displayQuestion();
          } else {
            myRow.innerHTML = new Result().showResult();
          }
        }, 1000);
      });
    });
  }
}

class Result {
  showResult() {
    return `
      <div
        class="result bg-white shadow-lg col-lg-6 offset-lg-3 p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3 animate__animated animate__fadeIn"
      >
        <h2 class="text-success">Quiz Completed 🎉</h2>
        <p class="h4">Your Score is: <span class="text-primary">${myQuiz.score}</span> out of <span>${AllQuestions.length}</span></p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

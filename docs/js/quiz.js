class QuizGame {
  constructor() {
    this.score = 0;
    this.questionIndex = 0;
    this.totalQuestions = 10;
    this.currentQuestion = null;
  }

  setCurrentQuestion(question) {
    this.currentQuestion = question;
  }

  answer(choice) {
    const isCorrect = choice === this.currentQuestion.correct;
    if (isCorrect) this.score++;
    this.questionIndex++;
    return isCorrect;
  }

  isFinished() {
    return this.questionIndex >= this.totalQuestions;
  }

  getScore() {
    return `${this.score} / ${this.totalQuestions}`;
  }

  getCorrectRate() {
    if (this.questionIndex === 0) return 0;
    return Math.round((this.score / this.totalQuestions) * 100);
  }
}

function shuffleChoices(choices) {
  const arr = [...choices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

if (typeof module !== 'undefined') {
  module.exports = { QuizGame, shuffleChoices };
}

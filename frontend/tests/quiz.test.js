const { QuizGame, shuffleChoices } = require('../js/quiz');

describe('QuizGame', () => {
  let game;

  beforeEach(() => {
    game = new QuizGame();
  });

  test('初期状態: score=0, questionIndex=0', () => {
    expect(game.score).toBe(0);
    expect(game.questionIndex).toBe(0);
  });

  test('isFinished()は10問未満でfalse', () => {
    expect(game.isFinished()).toBe(false);
  });

  test('10問終了でisFinished()がtrue', () => {
    for (let i = 0; i < 10; i++) {
      game.setCurrentQuestion({ correct: '正解' });
      game.answer('不正解');
    }
    expect(game.isFinished()).toBe(true);
  });

  test('正解でscore+1', () => {
    game.setCurrentQuestion({ correct: '旭酒造' });
    const result = game.answer('旭酒造');
    expect(result).toBe(true);
    expect(game.score).toBe(1);
  });

  test('不正解でscoreは変わらない', () => {
    game.setCurrentQuestion({ correct: '旭酒造' });
    const result = game.answer('久保田酒造');
    expect(result).toBe(false);
    expect(game.score).toBe(0);
  });

  test('答えるたびにquestionIndexが+1', () => {
    game.setCurrentQuestion({ correct: '旭酒造' });
    game.answer('旭酒造');
    expect(game.questionIndex).toBe(1);
  });

  test('getScore()は "正解数 / 10" 形式', () => {
    game.setCurrentQuestion({ correct: '旭酒造' });
    game.answer('旭酒造');
    expect(game.getScore()).toBe('1 / 10');
  });

  test('getCorrectRate()は0〜100の整数', () => {
    game.setCurrentQuestion({ correct: '旭酒造' });
    game.answer('旭酒造');
    expect(game.getCorrectRate()).toBe(10);
  });

  test('0問正解の場合getCorrectRate()は0', () => {
    expect(game.getCorrectRate()).toBe(0);
  });

  test('全問正解の場合getCorrectRate()は100', () => {
    for (let i = 0; i < 10; i++) {
      game.setCurrentQuestion({ correct: '正解' });
      game.answer('正解');
    }
    expect(game.getCorrectRate()).toBe(100);
  });
});

describe('shuffleChoices', () => {
  test('4要素が全て保持される', () => {
    const choices = ['A', 'B', 'C', 'D'];
    const shuffled = shuffleChoices(choices);
    expect(shuffled).toHaveLength(4);
    expect(shuffled).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
  });

  test('元の配列を変更しない', () => {
    const choices = ['A', 'B', 'C', 'D'];
    const original = [...choices];
    shuffleChoices(choices);
    expect(choices).toEqual(original);
  });

  test('100回中少なくとも1回は順序が変わる', () => {
    const choices = ['A', 'B', 'C', 'D'];
    const original = choices.join(',');
    let changed = false;
    for (let i = 0; i < 100; i++) {
      if (shuffleChoices(choices).join(',') !== original) {
        changed = true;
        break;
      }
    }
    expect(changed).toBe(true);
  });
});

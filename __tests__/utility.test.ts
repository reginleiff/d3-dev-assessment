import Utility from '../src/utility';

describe('Utility', () => {
  describe('Is Valid Email', () => {
    test.each([
      ['a@gmail.com', false],
      ['', false],
      ['a@gmail.com', false],
      ['efg@.com', false],
      ['abd@gmail.', false],
      ['higj@gmail.co', true],
      ['leya@gmail.co.edu.us', true],
      ['hifi@gmail.co.edu.', true],
      ['abc@gmail.com', true],
      ['high_lord@gmail.com', true],
      ['!high_lord!@gmail.com', false],
    ])(
      'When provided email (%s) - successfully validates or invalidates email',
      (email: string, isValid: boolean) =>
        expect(Utility.isValidEmail(email)).toBe(isValid)
    );
  });

  describe('Parse tagged emails', () => {
    test.each([
      [
        'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
        ['studentagnes@gmail.com', 'studentmiche@gmail.com'],
      ],
      [
        'Welcome @nigel@gmail.com and   @firenze@gmail.com to the party!',
        ['nigel@gmail.com', 'firenze@gmail.com'],
      ],
      [
        '@all Please report to the lecture hall @13:00hrs! Especially @lolmabeats@gmail.com and @a@aol.com ',
        ['lolmabeats@gmail.com'],
      ],
    ])(
      'When provided notification (%s) - should extract tagged emails',
      // @ts-ignore: Incorrect types provided
      (msg: string, expectedEmails: string[]) => {
        const emails: string[] = Utility.parseTaggedEmails(msg);
        expect(emails.length).toBe(expectedEmails.length);
        for (let expectedEmail of expectedEmails) {
          expect(emails).toContain(expectedEmail);
        }
      }
    );
  });
});

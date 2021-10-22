const emojis: Array<[string, number]> = [
  ['👍', 0],
  ['👍', 2],
  ['👍', 2],
  ['👍', 6],
  ['👍', 7],
  ['👍', 8],
  ['👍', 12],
  ['👍', 15],
  ['👍', 23],
  ['👍', 31],
  ['👍', 46],
];

const du = 46;

export const Emoji: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        height: 16,
        marginRight: 16,
      }}
    >
      {emojis.map((emoji, i) => (
        <span
          style={{
            position: 'absolute',
            left: `${(emoji[1] / du) * 100}%`,
            fontSize: 16,
            opacity: 0.6,
            cursor: 'pointer',
          }}
          key={i}
        >
          {emoji[0]}
        </span>
      ))}
    </div>
  );
};

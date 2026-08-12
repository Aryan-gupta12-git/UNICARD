export const renderSpiderComicName = (name: string) => {
  if (!name) return null;
  const trimmed = name.trim();
  const spaceIndex = trimmed.indexOf(' ');

  if (spaceIndex === -1) {
    return <span className="name-first-word">{trimmed}</span>;
  }

  const firstWord = trimmed.slice(0, spaceIndex);
  const restWords = trimmed.slice(spaceIndex + 1);

  return (
    <>
      <span className="name-first-word">{firstWord}</span>
      <span className="name-rest-words">{restWords}</span>
    </>
  );
};

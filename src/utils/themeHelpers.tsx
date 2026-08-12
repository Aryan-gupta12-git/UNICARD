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

export const renderBarbieName = (name: string) => {
  if (!name) return null;
  const trimmed = name.trim();
  const spaceIndex = trimmed.indexOf(' ');

  // Single word name (e.g. Barbie)
  if (spaceIndex === -1) {
    const isLong = trimmed.length > 9;
    return (
      <span className={`barbie-name-single ${isLong ? 'is-long' : ''}`}>
        {trimmed}
      </span>
    );
  }

  // Multi-word name: first name on top line, last name / rest of words below it
  const firstWord = trimmed.slice(0, spaceIndex);
  const restWords = trimmed.slice(spaceIndex + 1);

  const isFirstLong = firstWord.length > 8;
  const isRestLong = restWords.length > 8;

  return (
    <span className="barbie-name-stacked">
      <span className={`barbie-name-first ${isFirstLong ? 'is-long' : ''}`}>
        {firstWord}
      </span>
      <span className={`barbie-name-rest ${isRestLong ? 'is-long' : ''}`}>
        {restWords}
      </span>
    </span>
  );
};

export const renderThemeName = (name: string, themeClass?: string) => {
  if (!name) return null;
  if (themeClass === 'pink-pop-theme' || themeClass === 'pink-theme') {
    return renderBarbieName(name);
  }
  if (themeClass === 'spider-comic-theme') {
    return renderSpiderComicName(name);
  }
  return name;
};


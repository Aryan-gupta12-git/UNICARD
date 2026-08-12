export const getThemeClass = (theme?: string): string => {
  if (!theme) return 'comic-theme';
  const t = theme.toLowerCase();
  if (t === 'uno' || t === 'uno-theme') return 'uno-theme';
  if (t === 'zombie' || t === 'zombie-theme') return 'zombie-theme';
  if (t === 'pink-theme' || t === 'pink-pop' || t === 'pink-pop-theme') return 'pink-pop-theme';
  if (t === 'spider' || t === 'spider-comic' || t === 'spider-comic-theme') return 'spider-comic-theme';
  return 'comic-theme';
};

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

export const renderUnoName = (name: string) => {
  if (!name) return null;
  const trimmed = name.trim();
  const spaceIndex = trimmed.indexOf(' ');

  if (spaceIndex === -1) {
    const isLong = trimmed.length > 9;
    return (
      <span className={`uno-name-single ${isLong ? 'is-long' : ''}`}>
        {trimmed}
      </span>
    );
  }

  const firstWord = trimmed.slice(0, spaceIndex);
  const restWords = trimmed.slice(spaceIndex + 1);

  const isFirstLong = firstWord.length > 8;
  const isRestLong = restWords.length > 8;

  return (
    <span className="uno-name-stacked">
      <span className={`uno-name-first ${isFirstLong ? 'is-long' : ''}`}>
        {firstWord}
      </span>
      <span className={`uno-name-rest ${isRestLong ? 'is-long' : ''}`}>
        {restWords}
      </span>
    </span>
  );
};

export const renderZombieName = (name: string) => {
  if (!name) return null;
  const trimmed = name.trim();
  const spaceIndex = trimmed.indexOf(' ');

  if (spaceIndex === -1) {
    const isLong = trimmed.length > 9;
    return (
      <span className={`zombie-name-single ${isLong ? 'is-long' : ''}`}>
        {trimmed}
      </span>
    );
  }

  const firstWord = trimmed.slice(0, spaceIndex);
  const restWords = trimmed.slice(spaceIndex + 1);

  const isFirstLong = firstWord.length > 8;
  const isRestLong = restWords.length > 8;

  return (
    <span className="zombie-name-stacked">
      <span className={`zombie-name-first ${isFirstLong ? 'is-long' : ''}`}>
        {firstWord}
      </span>
      <span className={`zombie-name-rest ${isRestLong ? 'is-long' : ''}`}>
        {restWords}
      </span>
    </span>
  );
};

export const renderThemeName = (name: string, themeClass?: string) => {
  if (!name) return null;
  const normalized = getThemeClass(themeClass);
  if (normalized === 'pink-pop-theme') {
    return renderBarbieName(name);
  }
  if (normalized === 'spider-comic-theme') {
    return renderSpiderComicName(name);
  }
  if (normalized === 'uno-theme') {
    return renderUnoName(name);
  }
  if (normalized === 'zombie-theme') {
    return renderZombieName(name);
  }
  return name;
};

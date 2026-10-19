import { parseResponsibilitiesList } from '../utils/displayFormatUtils';

const ResponsibilitiesList = ({ text, className = '', itemClassName = '' }) => {
  const items = parseResponsibilitiesList(text);
  if (!items.length) return null;

  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={index} className={itemClassName}>
          {item}
        </li>
      ))}
    </ul>
  );
};

export default ResponsibilitiesList;

import { createElement, type ElementType } from 'react';

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** 'lines' expects text separated by \n, 'words' splits on spaces */
  by?: 'lines' | 'words';
  innerClassName?: string;
  id?: string;
};

/** Accessible split text: screen readers get the full sentence, visual spans are aria-hidden. */
export default function SplitText({ text, as = 'span', className = '', by = 'words', innerClassName = '', id }: Props) {
  const lines = text.split('\n');
  const content =
    by === 'lines'
      ? lines.map((line, i) => (
          <span key={i} className="split-line" aria-hidden="true">
            <span className={`split-inner ${innerClassName}`}>{line}</span>
          </span>
        ))
      : lines.map((line, li) => (
          <span key={li} className="block" aria-hidden="true">
            {line.split(' ').map((w, i, arr) => (
              <span key={i} className="split-word">
                <span className={`split-inner ${innerClassName}`}>
                  {w}
                  {i < arr.length - 1 ? ' ' : ''}
                </span>
              </span>
            ))}
          </span>
        ));
  return createElement(as, { id, className, 'aria-label': text.replace(/\n/g, ' ') }, content);
}

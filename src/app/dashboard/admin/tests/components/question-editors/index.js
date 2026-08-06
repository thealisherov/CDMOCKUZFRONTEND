/**
 * editorKind → komponent registry.
 */

import GapLinesEditor from './GapLinesEditor';
import TableRowsEditor from './TableRowsEditor';
import McqSingleEditor from './McqSingleEditor';
import McqMultiSpreadEditor from './McqMultiSpreadEditor';
import McqMultiCombinedEditor from './McqMultiCombinedEditor';
import MatchListEditor from './MatchListEditor';
import LetterRangeEditor from './LetterRangeEditor';
import TfngEditor from './TfngEditor';
import HeadingsEditor from './HeadingsEditor';
import WordBankEditor from './WordBankEditor';
import ShortAnswerEditor from './ShortAnswerEditor';
import FlowChartEditor from './FlowChartEditor';

export const EDITOR_REGISTRY = {
  gapLines: GapLinesEditor,
  tableRows: TableRowsEditor,
  mcqSingle: McqSingleEditor,
  mcqMultiSpread: McqMultiSpreadEditor,
  mcqMultiCombined: McqMultiCombinedEditor,
  matchList: MatchListEditor,
  letterRange: LetterRangeEditor,
  tfng: TfngEditor,
  headings: HeadingsEditor,
  wordBank: WordBankEditor,
  shortAnswer: ShortAnswerEditor,
  flowChart: FlowChartEditor,
};

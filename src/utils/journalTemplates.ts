import { ContentBlock } from '../types/workspace';
import { generateId } from './dateUtils';

export interface JournalTemplate {
  id: string;
  label: string;
  focusLine: string;
  tone: string;
  buildBlocks: () => ContentBlock[];
}

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 'morning-clarity',
    label: 'Morning Clarity',
    tone: 'Grounded',
    focusLine: 'Protect my highest-leverage hour before opening messages.',
    buildBlocks: () => [
      {
        id: generateId('blk'),
        type: 'heading',
        content: 'Morning check-in',
      },
      {
        id: generateId('blk'),
        type: 'callout',
        content: 'What is the one thing that, if finished today, makes everything else easier?',
      },
      {
        id: generateId('blk'),
        type: 'todo',
        content: 'Complete top priority before checking inbox',
        checked: false,
      },
      {
        id: generateId('blk'),
        type: 'bullet',
        content: 'Grateful for: ',
      },
      {
        id: generateId('blk'),
        type: 'bullet',
        content: 'Letting go of today: ',
      },
    ],
  },
  {
    id: 'evening-wind-down',
    label: 'Evening Wind-Down',
    tone: 'Reflective',
    focusLine: 'Close open loops cleanly and rest without guilt.',
    buildBlocks: () => [
      {
        id: generateId('blk'),
        type: 'heading',
        content: 'Evening reflection',
      },
      {
        id: generateId('blk'),
        type: 'bullet',
        content: 'Today’s quiet win: ',
      },
      {
        id: generateId('blk'),
        type: 'bullet',
        content: 'One thing I learned or noticed: ',
      },
      {
        id: generateId('blk'),
        type: 'todo',
        content: 'Pick #1 focus for tomorrow morning',
        checked: false,
      },
    ],
  },
  {
    id: 'weekly-reset',
    label: 'Weekly Reset',
    tone: 'Focused',
    focusLine: 'Fewer commitments, sharper execution this week.',
    buildBlocks: () => [
      {
        id: generateId('blk'),
        type: 'heading',
        content: 'Weekly review & reset',
      },
      {
        id: generateId('blk'),
        type: 'bullet',
        content: 'Biggest highlight from the past 7 days: ',
      },
      {
        id: generateId('blk'),
        type: 'bullet',
        content: 'What drained energy or felt noisy: ',
      },
      {
        id: generateId('blk'),
        type: 'todo',
        content: 'Archive finished notes and carry forward key tasks',
        checked: false,
      },
    ],
  },
];

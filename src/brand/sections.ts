export interface GuideSection {
  id: string;
  label: string;
}

export const GUIDE_SECTIONS: GuideSection[] = [
  { id: 'start-here', label: 'Start here' },
  { id: 'logo', label: 'Logo' },
  { id: 'color', label: 'Color' },
  { id: 'type', label: 'Type' },
  { id: 'photos', label: 'Photos' },
  { id: 'voice', label: 'Voice' },
  { id: 'motion', label: 'Motion' },
  { id: 'components', label: 'Components' },
  { id: 'in-use', label: 'In use' },
  { id: 'templates', label: 'Templates' },
  { id: 'make-something', label: 'Make something' },
];

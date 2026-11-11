import { Button, SegmentedControl, TextField } from '@masschallenge/propellant-web';
import { useEffect, useMemo, useRef, useState } from 'react';
import { copyRich, copyText } from '../../brand/clipboard';
import {
  EMAIL_FONT_STACK,
  EMPTY_SIGNATURE,
  SIGNATURE_LOGOS,
  SITE_ORIGIN,
  signatureHtml,
  signatureNotes,
  signatureText,
  type SignatureFields,
  type SignatureLogo,
} from '../../brand/signature';
import MailWindow from './MailWindow';

type TextFieldName = Exclude<keyof SignatureFields, 'logo'>;

interface FieldSetup {
  name: TextFieldName;
  label: string;
  placeholder: string;
  isOptional: boolean;
  type?: string;
  autoComplete?: string;
}

const FIELDS: FieldSetup[] = [
  {
    name: 'name',
    label: 'Name',
    placeholder: 'Alex Rivera',
    isOptional: false,
    autoComplete: 'name',
  },
  { name: 'pronouns', label: 'Pronouns', placeholder: 'they/them', isOptional: true },
  {
    name: 'title',
    label: 'Title',
    placeholder: 'Program manager',
    isOptional: false,
    autoComplete: 'organization-title',
  },
  { name: 'team', label: 'Team', placeholder: 'Programs', isOptional: true },
  {
    name: 'phone',
    label: 'Phone',
    placeholder: '+1 617 555 0100',
    isOptional: true,
    type: 'tel',
    autoComplete: 'tel',
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'you@example.org',
    isOptional: false,
    type: 'email',
    autoComplete: 'email',
  },
  { name: 'link', label: 'Link', placeholder: 'masschallenge.org', isOptional: true, type: 'url' },
];

const LOGO_ITEMS = (Object.keys(SIGNATURE_LOGOS) as SignatureLogo[]).map((logo) => ({
  id: logo,
  label: SIGNATURE_LOGOS[logo].label,
}));

const SignatureBuilder = () => {
  const [fields, setFields] = useState<SignatureFields>(EMPTY_SIGNATURE);
  const [touched, setTouched] = useState<Partial<Record<TextFieldName, boolean>>>({});
  const [status, setStatus] = useState('');
  const [previewOrigin, setPreviewOrigin] = useState(SITE_ORIGIN);
  const clearTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setPreviewOrigin(window.location.origin);
    return () => window.clearTimeout(clearTimer.current);
  }, []);

  const notes = useMemo(() => signatureNotes(fields), [fields]);
  const previewHtml = useMemo(() => signatureHtml(fields, previewOrigin), [fields, previewOrigin]);
  const isMissingRequired = notes.some((note) =>
    FIELDS.some(
      (field) => field.name === note.field && !field.isOptional && !fields[field.name].trim(),
    ),
  );

  const updateField = (name: keyof SignatureFields, value: string) =>
    setFields((current) => ({ ...current, [name]: value }));

  const announce = (message: string) => {
    setStatus(message);
    window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setStatus(''), 4000);
  };

  const handleCopySignature = async () => {
    const isCopied = await copyRich(signatureHtml(fields), signatureText(fields));
    announce(
      isCopied
        ? 'Copied your signature. Paste it into the signature settings of your mail app.'
        : 'Your browser blocked copying. Use Copy HTML, or select the preview and copy it.',
    );
  };

  const handleCopyHtml = async () => {
    const isCopied = await copyText(signatureHtml(fields));
    announce(isCopied ? 'Copied the HTML.' : 'Your browser blocked copying.');
  };

  const notesFor = (name: TextFieldName) => notes.filter((note) => note.field === name);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <form
        className="flex flex-col gap-5"
        aria-label="Your signature details"
        onSubmit={(event) => event.preventDefault()}
      >
        {FIELDS.map((field) => {
          const fieldNotes = notesFor(field.name);
          const shownNotes = fieldNotes.filter(
            (note) => note.suggestion || touched[field.name] || fields[field.name].trim(),
          );
          const suggestion = shownNotes.find((note) => note.suggestion)?.suggestion;
          return (
            <div key={field.name} className="flex flex-col gap-2">
              <TextField
                label={field.label}
                hintEnd={field.isOptional ? 'Optional' : undefined}
                required={!field.isOptional}
                placeholder={field.placeholder}
                type={field.type ?? 'text'}
                autoComplete={field.autoComplete ?? 'off'}
                value={fields[field.name]}
                invalid={shownNotes.some((note) => !note.suggestion)}
                hint={shownNotes.map((note) => note.message).join(' ') || undefined}
                onChange={(event) => updateField(field.name, event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, [field.name]: true }))}
              />
              {suggestion ? (
                <div>
                  <Button
                    size="sm"
                    variant="tinted"
                    onClick={() => updateField(field.name, suggestion)}
                  >
                    Use sentence case
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
        <div className="flex flex-col gap-2">
          <span className="text-callout font-semibold">Logo</span>
          <SegmentedControl
            aria-label="Logo"
            items={LOGO_ITEMS}
            value={fields.logo}
            onChange={(id) => updateField('logo', id)}
          />
          <p className="m-0 text-footnote text-[var(--label-secondary)]">
            The horizontal logo is the default. The monogram suits a short signature where your
            email already says MassChallenge.
          </p>
        </div>
      </form>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <MailWindow theme="light" html={previewHtml} />
          <MailWindow theme="dark" html={previewHtml} />
        </div>
        <div className="flex flex-col gap-3 rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] p-5">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleCopySignature}
              disabled={isMissingRequired}
              focusableWhenDisabled
            >
              Copy signature
            </Button>
            <Button
              variant="gray"
              onClick={handleCopyHtml}
              disabled={isMissingRequired}
              focusableWhenDisabled
            >
              Copy HTML
            </Button>
          </div>
          <p
            aria-live="polite"
            className="m-0 min-h-5 text-callout font-semibold text-[var(--label)]"
          >
            {status ||
              (isMissingRequired ? 'Add your name, title and email to copy your signature.' : '')}
          </p>
          <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-subheadline text-[var(--label-secondary)]">
            <li>
              Copy signature puts formatted text on your clipboard, ready to paste into the
              signature settings of your mail app. Copy HTML is for apps that ask for the code.
            </li>
            <li>
              The signature is a simple table with the styles written into it, so it holds up in any
              mail app.
            </li>
            <li>
              It asks for Lato first, but most people who read your email do not have Lato
              installed, so it falls back to {EMAIL_FONT_STACK.split(', ').slice(1).join(', ')}.
            </li>
            <li>
              The logo loads from {SITE_ORIGIN.replace('https://', '')}, sits on its own white tile
              with clear space of half its height, and stays on white even when a mail app turns
              dark.
            </li>
            <li>
              We fix the spelling of MassChallenge, swap long dashes for commas and suggest sentence
              case for your title and team.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignatureBuilder;

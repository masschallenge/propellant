import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  SegmentedControl,
  Switch,
  TextField,
} from '@masschallenge/propellant-web';
import { ThemedPreview } from './ThemedPreview';

const IMPORT = (names: string) => `import { ${names} } from '@masschallenge/propellant-web';\n\n`;

const VIEW_ITEMS = [
  { id: 'list', label: 'List' },
  { id: 'board', label: 'Board' },
  { id: 'calendar', label: 'Calendar' },
];

const ComponentPreviews = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <ThemedPreview
      title="Button"
      description="Filled for the main action, tinted and gray for the rest, plain for quiet links. Every label starts with a verb."
      code={`${IMPORT('Button')}<Button>Save changes</Button>
<Button variant="tinted">Add a mentor</Button>
<Button variant="gray">Cancel</Button>
<Button variant="plain">Read the guide</Button>
<Button destructive>Delete draft</Button>`}
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button>Save changes</Button>
        <Button variant="tinted">Add a mentor</Button>
        <Button variant="gray">Cancel</Button>
        <Button variant="plain">Read the guide</Button>
        <Button destructive>Delete draft</Button>
      </div>
    </ThemedPreview>

    <ThemedPreview
      title="Badge"
      description="A short status. The word carries the meaning, so it never relies on color alone."
      code={`${IMPORT('Badge')}<Badge>Draft</Badge>
<Badge tone="info">In review</Badge>
<Badge tone="success" dot>Accepted</Badge>
<Badge tone="warning">Due soon</Badge>
<Badge tone="critical">Late</Badge>`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge>Draft</Badge>
        <Badge tone="info">In review</Badge>
        <Badge tone="success" dot>
          Accepted
        </Badge>
        <Badge tone="warning">Due soon</Badge>
        <Badge tone="critical">Late</Badge>
      </div>
    </ThemedPreview>

    <ThemedPreview
      title="Card"
      description="Groups one thing with its actions."
      surface="grouped"
      code={`${IMPORT('Button, Card')}<Card
  title="Your application"
  description="Draft"
  titleBadge="New"
  actions={<Button size="sm" variant="tinted">Open</Button>}
>
  Add your company website to submit your application.
</Card>`}
    >
      <Card
        title="Your application"
        description="Draft"
        titleBadge="New"
        actions={
          <Button size="sm" variant="tinted">
            Open
          </Button>
        }
      >
        Add your company website to submit your application.
      </Card>
    </ThemedPreview>

    <ThemedPreview
      title="Text field"
      description="Always with a visible label. Hints say what to type, not what went wrong."
      code={`${IMPORT('TextField')}<TextField
  label="Company website"
  placeholder="example.com"
  hint="Add it to submit your application."
/>`}
    >
      <div className="mx-auto max-w-sm">
        <TextField
          label="Company website"
          placeholder="example.com"
          hint="Add it to submit your application."
        />
      </div>
    </ThemedPreview>

    <ThemedPreview
      title="Switch"
      description="Turns one setting on or off, and takes effect straight away."
      code={`${IMPORT('Switch')}<Switch
  label="Email me about new programs"
  hint="You can turn this off at any time."
  defaultChecked
/>`}
    >
      <div className="mx-auto max-w-sm">
        <Switch
          label="Email me about new programs"
          hint="You can turn this off at any time."
          defaultChecked
        />
      </div>
    </ThemedPreview>

    <ThemedPreview
      title="Segmented control"
      description="Picks one of a few views or options."
      code={`${IMPORT('SegmentedControl')}<SegmentedControl
  aria-label="View"
  items={[
    { id: 'list', label: 'List' },
    { id: 'board', label: 'Board' },
    { id: 'calendar', label: 'Calendar' },
  ]}
  defaultValue="list"
/>`}
    >
      <div className="flex justify-center">
        <SegmentedControl aria-label="View" items={VIEW_ITEMS} defaultValue="list" />
      </div>
    </ThemedPreview>

    <ThemedPreview
      title="Banner"
      description="A message about the whole page. Say what happened and how to fix it."
      code={`${IMPORT('Banner')}<Banner tone="info" title="Applications are open">
  Find a program that fits your startup.
</Banner>
<Banner tone="critical" title="We could not save your changes">
  Check your connection and try again.
</Banner>`}
    >
      <div className="flex flex-col gap-3">
        <Banner tone="info" title="Applications are open">
          Find a program that fits your startup.
        </Banner>
        <Banner tone="critical" title="We could not save your changes">
          Check your connection and try again.
        </Banner>
      </div>
    </ThemedPreview>

    <ThemedPreview
      title="Avatar"
      description="A person, shown by their photo or initials. Uploaded photos are never cropped by the interface."
      code={`${IMPORT('Avatar')}<Avatar size="sm" initials="AR" alt="Alex Rivera" />
<Avatar initials="JL" alt="Jordan Lee" status="online" />
<Avatar size="lg" initials="SK" alt="Sam Kim" />
<Avatar size="xl" />`}
    >
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Avatar size="sm" initials="AR" alt="Alex Rivera" />
        <Avatar initials="JL" alt="Jordan Lee" status="online" />
        <Avatar size="lg" initials="SK" alt="Sam Kim" />
        <Avatar size="xl" />
      </div>
    </ThemedPreview>
  </div>
);

export default ComponentPreviews;

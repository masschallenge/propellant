---
title: Propellant in Claude
description: The Propellant skill makes everything people create with Claude on brand automatically.
---

The Propellant skill teaches Claude the MassChallenge brand. Once it is installed, anyone who asks
Claude for an app, a prototype, a web page, a slide deck, a document or a spreadsheet gets one that
already uses our colors, fonts, logo, layouts and voice. Nobody has to describe the brand or think
about design, or even mention MassChallenge: Claude treats work for MassChallenge as on brand by
default, starts from the Propellant templates and components, and checks its own work before
handing it over.

[Download the Propellant skill](/downloads/propellant-brand.zip)

## What it does

- Picks the right starting point for what you asked for: the Propellant PowerPoint, Word or Excel
  template, the web stylesheet for prototypes and pages, or the `propellant-web` package for apps.
- In an existing codebase, builds with the Propellant components and tokens already there, adds the
  `propellant-web` package to MassChallenge apps that lack it, and never hardcodes colors or fonts.
- Points people to the [content studio](/studio/) for social posts and the
  [signature builder](/studio/signature/) for email signatures.
- Reads the newest rules from [llms-full.txt](/llms-full.txt) when it can reach the web.
- Applies the palette, Lato and Oswald, the logo rules, sentence case and our voice, including no
  em dashes.
- Follows the chart, photography and accessibility guidelines.
- Runs a checker that flags colors outside the palette, other fonts and dashes in the files it
  makes.
- Never invents numbers, quotes or results to fill a template.

## Install it for everyone on claude.ai

An organization owner on a Team or Enterprise plan does this once.

1. Download [the skill](/downloads/propellant-brand.zip). Do not unzip it.
2. In claude.ai, open **Organization settings**, then **Plugins & skills**. Under **Policy**, make
   sure skills and code execution are turned on.
3. Choose **Add**, then **Upload a skill**, and select the file.

The skill is then available to everyone in the organization. People can turn it off for themselves
in their own settings, but it is on by default. Anthropic's
[guide to provisioning skills](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization)
has the current steps, which may be named differently in your admin console.

## Install it in Claude Code

For engineers, the quickest way is to install it for every project on your computer:

```bash
curl -fsSL https://propellant.masschallenge.org/downloads/propellant-brand.zip -o /tmp/propellant-brand.zip && unzip -o /tmp/propellant-brand.zip -d ~/.claude/skills/
```

That leaves `~/.claude/skills/propellant-brand/SKILL.md` in place. Run the same command again to
update it.

To share it with everyone who works in one repository, unzip it into that repository's
`.claude/skills/` folder instead, so that `.claude/skills/propellant-brand/SKILL.md` exists, and
commit it.

## Keep it current

The skill on this page is rebuilt every time this site is published, from the latest releases of
`propellant-web` and `propellant-office`. Its `SKILL.md` names the two releases it was built from.
After a Propellant release, download it again and upload it again in the same place. Check that the new version replaced the old one rather than adding a
second copy.

## Org instructions

If your organization's Claude settings include default document styles, such as a default font for
Word files, update them to point to Propellant. Otherwise the two sets of instructions disagree, and
Claude may follow the older one.

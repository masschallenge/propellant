import re
import sys
import zipfile
from pathlib import Path

PALETTE = {
    "0EABBC",
    "808285",
    "10263F",
    "222222",
    "F8F8F5",
    "FFFFFF",
    "004F73",
    "00708E",
    "54EEFF",
    "00CFE8",
    "037AA6",
    "051925",
    "FFC801",
    "FF6B35",
    "F58242",
    "D14170",
    "D83B80",
    "C6F135",
    "91D438",
    "F3FAFC",
    "DBE1E3",
    "848F92",
    "4B575B",
    "000000",
}

WARM_ACCENTS = {
    "FFC801": "Yellow",
    "FF6B35": "Orange",
    "F58242": "Orange",
    "D14170": "Raspberry",
    "D83B80": "Raspberry",
    "C6F135": "Lime",
    "91D438": "Lime",
}

RETIRED_COLORS = {
    "044451": "Deep Teal #004F73 or Navy #10263F",
    "065E6F": "Teal #00708E",
    "068DA4": "Teal #00708E or MC Blue #0EABBC",
    "0FACBD": "MC Blue #0EABBC for shapes, or Cyan #54EEFF for text on dark",
    "D9F6FA": "Warm White #F8F8F5 or the light tint #F3FAFC",
    "F3FBFC": "Warm White #F8F8F5 or the light tint #F3FAFC",
    "1E282B": "Black #222222",
    "BF0261": "Raspberry #D14170 on dark, or a status color in the product",
    "17ACBC": "the logo files as supplied",
    "828486": "the logo files as supplied",
    "C7F2EF": "the hero overlay, not the retired duotone",
    "003349": "the hero overlay, not the retired duotone",
}

FONTS = {
    "lato",
    "oswald",
    "propellant sans",
    "aptos",
    "aptos narrow",
    "+mj-lt",
    "+mn-lt",
    "+mj-ea",
    "+mn-ea",
    "+mj-cs",
    "+mn-cs",
}

RETIRED_FONTS = {"gotham", "bebas", "bebas neue", "arial", "arial narrow", "montserrat", "open sans"}

DASHES = re.compile("[–—]")

OFFICE_CONTENT = {
    ".docx": r"^word/(document|header\d*|footer\d*)\.xml$",
    ".pptx": r"^ppt/slides/slide\d+\.xml$",
    ".xlsx": r"^xl/(worksheets/sheet\d+|sharedStrings|charts/chart\d+)\.xml$",
}

OFFICE_TEXT = re.compile(r"<(?:w|a):t(?:\s[^>]*)?>([^<]*)</(?:w|a):t>|<t(?:\s[^>]*)?>([^<]*)</t>")
OFFICE_COLOR = re.compile(r'(?:w:color w:val|w:fill|srgbClr val|rgb)="(?:FF)?([0-9A-Fa-f]{6})"')
OFFICE_FONT = re.compile(r'(?:w:ascii|latin typeface|<name val)="([^"]+)"')

STYLESHEET_BLOCK = re.compile(r"/\* propellant-website\.css start \*/.*?/\* propellant-website\.css end \*/", re.S)
CSS_HEX = re.compile(r"#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b")
CSS_FONT_FAMILY = re.compile(r"font-family\s*:\s*([^;}\"]+)")
HTML_TAGS = re.compile(r"<style.*?</style>|<script.*?</script>|<[^>]+>", re.S)


def expand_hex(value):
    value = value.upper()
    return "".join(character * 2 for character in value) if len(value) == 3 else value


def color_problems(colors, where):
    problems = []
    for color in sorted(colors - PALETTE):
        if color in RETIRED_COLORS:
            problems.append(f"{where}: color #{color} is a retired brand color, use {RETIRED_COLORS[color]}")
        else:
            problems.append(f"{where}: color #{color} is not in the MassChallenge palette")
    return problems


def accent_problems(colors, where):
    accents = sorted({WARM_ACCENTS[color] for color in colors if color in WARM_ACCENTS})
    if len(accents) < 2:
        return []
    return [f"{where}: more than one warm accent ({', '.join(accents)}), use one per piece"]


def font_problem(font, where):
    family = font.lower()
    if family in FONTS:
        return None
    if family in RETIRED_FONTS:
        return f"{where}: font {font} is retired, use Oswald and Lato, or Aptos Narrow and Aptos where they will not load"
    return f"{where}: font {font} is not Lato, Oswald or the Aptos fallback"


def check_text(text, where):
    return [f"{where}: em or en dash in \"{match.string[max(0, match.start() - 20):match.end() + 20].strip()}\"" for match in DASHES.finditer(text)]


def check_office(path):
    pattern = OFFICE_CONTENT[path.suffix.lower()]
    problems = []
    used_colors = set()
    with zipfile.ZipFile(path) as package:
        for name in package.namelist():
            if not re.search(pattern, name):
                continue
            xml = package.read(name).decode("utf-8", errors="replace")
            colors = {expand_hex(match) for match in OFFICE_COLOR.findall(xml)}
            used_colors |= colors
            problems.extend(color_problems(colors, name))
            for font in sorted(set(OFFICE_FONT.findall(xml))):
                problem = font_problem(font, name)
                if problem:
                    problems.append(problem)
            text = " ".join(first or second for first, second in OFFICE_TEXT.findall(xml))
            problems.extend(check_text(text, name))
    problems.extend(accent_problems(used_colors, path.name))
    return problems


def first_family(declaration):
    family = declaration.split(",")[0].strip().strip("'\"").lower()
    return family


def check_html(path):
    source = path.read_text(encoding="utf-8", errors="replace")
    own_styles = STYLESHEET_BLOCK.sub("", source)
    colors = {expand_hex(match) for match in CSS_HEX.findall(own_styles)}
    problems = color_problems(colors, path.name) + accent_problems(colors, path.name)
    for declaration in CSS_FONT_FAMILY.findall(own_styles):
        family = first_family(declaration)
        if family.startswith("var(") or family in {"inherit", "system-ui"}:
            continue
        problem = font_problem(family, path.name)
        if problem:
            problems.append(problem)
    visible_text = HTML_TAGS.sub(" ", source)
    problems.extend(check_text(visible_text, path.name))
    return problems


def check(path):
    suffix = path.suffix.lower()
    if suffix in OFFICE_CONTENT:
        return check_office(path)
    if suffix in {".html", ".htm", ".css"}:
        return check_html(path)
    raise ValueError(f"Cannot check {path.name}: use a .docx, .pptx, .xlsx, .html or .css file")


def main(arguments):
    if not arguments:
        print("Usage: python3 check_brand.py FILE [FILE ...]")
        return 2
    exit_code = 0
    for argument in arguments:
        path = Path(argument)
        problems = check(path)
        if problems:
            exit_code = 1
            print(f"{path.name}: {len(problems)} problem(s)")
            for problem in problems:
                print(f"  - {problem}")
        else:
            print(f"{path.name}: on brand")
    return exit_code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

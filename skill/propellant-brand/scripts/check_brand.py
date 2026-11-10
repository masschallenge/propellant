import re
import sys
import zipfile
from pathlib import Path

PALETTE = {
    "1E282B",
    "4B575B",
    "FFFFFF",
    "F3F6F7",
    "F3FBFC",
    "DBE1E3",
    "065E6F",
    "044451",
    "068DA4",
    "0FACBD",
    "D9F6FA",
    "C4EEF4",
    "FFC801",
    "A30253",
    "BF0261",
    "848F92",
    "000000",
}

FONTS = {"lato", "oswald", "propellant sans", "+mj-lt", "+mn-lt", "+mj-ea", "+mn-ea", "+mj-cs", "+mn-cs"}

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


def check_text(text, where):
    return [f"{where}: em or en dash in \"{match.string[max(0, match.start() - 20):match.end() + 20].strip()}\"" for match in DASHES.finditer(text)]


def check_office(path):
    pattern = OFFICE_CONTENT[path.suffix.lower()]
    problems = []
    with zipfile.ZipFile(path) as package:
        for name in package.namelist():
            if not re.search(pattern, name):
                continue
            xml = package.read(name).decode("utf-8", errors="replace")
            for color in sorted({expand_hex(match) for match in OFFICE_COLOR.findall(xml)} - PALETTE):
                problems.append(f"{name}: color #{color} is not in the Propellant palette")
            for font in sorted({font for font in OFFICE_FONT.findall(xml) if font.lower() not in FONTS}):
                problems.append(f"{name}: font {font} is not Lato or Oswald")
            text = " ".join(first or second for first, second in OFFICE_TEXT.findall(xml))
            problems.extend(check_text(text, name))
    return problems


def first_family(declaration):
    family = declaration.split(",")[0].strip().strip("'\"").lower()
    return family


def check_html(path):
    source = path.read_text(encoding="utf-8", errors="replace")
    own_styles = STYLESHEET_BLOCK.sub("", source)
    problems = []
    for color in sorted({expand_hex(match) for match in CSS_HEX.findall(own_styles)} - PALETTE):
        problems.append(f"{path.name}: color #{color} is not in the Propellant palette")
    for declaration in CSS_FONT_FAMILY.findall(own_styles):
        family = first_family(declaration)
        if family not in FONTS and not family.startswith("var(") and family not in {"inherit", "system-ui"}:
            problems.append(f"{path.name}: font {family} is not Lato or Oswald")
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

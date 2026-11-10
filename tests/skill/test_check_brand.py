import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "skill" / "propellant-brand" / "scripts"))

from check_brand import check  # noqa: E402


def write_package(directory, name, entries):
    path = Path(directory) / name
    with zipfile.ZipFile(path, "w") as package:
        for entry, text in entries.items():
            package.writestr(entry, text)
    return path


class CheckBrand(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.mkdtemp()

    def test_accepts_brand_colors_fonts_and_punctuation_in_a_deck(self):
        slide = '<p:sld><a:rPr><a:solidFill><a:srgbClr val="044451"/></a:solidFill><a:latin typeface="Lato"/></a:rPr><a:t>Applications grew, again.</a:t></p:sld>'
        path = write_package(self.directory, "deck.pptx", {"ppt/slides/slide1.xml": slide})
        self.assertEqual(check(path), [])

    def test_flags_other_colors_fonts_and_dashes_in_a_document(self):
        body = '<w:document><w:rFonts w:ascii="Comic Sans MS"/><w:color w:val="FF0000"/><w:t>Growth — fast</w:t></w:document>'
        path = write_package(self.directory, "memo.docx", {"word/document.xml": body})
        problems = check(path)
        self.assertTrue(any("FF0000" in problem for problem in problems))
        self.assertTrue(any("Comic Sans MS" in problem for problem in problems))
        self.assertTrue(any("dash" in problem for problem in problems))

    def test_skips_the_inlined_propellant_stylesheet_in_html(self):
        page = Path(self.directory) / "page.html"
        page.write_text(
            "<style>/* propellant-website.css start */ :root { --x: #123456; } /* propellant-website.css end */"
            " .card { color: #1E282B; font-family: 'Lato', sans-serif; }</style><h1>Hello</h1>",
            encoding="utf-8",
        )
        self.assertEqual(check(page), [])

    def test_flags_off_brand_html(self):
        page = Path(self.directory) / "page.html"
        page.write_text("<style>.card { color: #ff00aa; font-family: Arial; }</style><p>Big – news</p>", encoding="utf-8")
        self.assertEqual(len(check(page)), 3)


if __name__ == "__main__":
    unittest.main()

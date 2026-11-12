import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "skill" / "propellant-brand" / "scripts"))

from check_brand import PALETTE, check  # noqa: E402


def write_package(directory, name, entries):
    path = Path(directory) / name
    with zipfile.ZipFile(path, "w") as package:
        for entry, text in entries.items():
            package.writestr(entry, text)
    return path


def write_page(directory, html):
    page = Path(directory) / "page.html"
    page.write_text(html, encoding="utf-8")
    return page


class CheckBrand(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.mkdtemp()

    def test_holds_the_brand_guide_palette(self):
        for color in ["0EABBC", "10263F", "222222", "F8F8F5", "004F73", "00708E", "54EEFF", "FFC801", "FF6B35", "D14170", "C6F135", "F3FAFC"]:
            self.assertIn(color, PALETTE)
        for retired in ["044451", "065E6F", "0FACBD", "D9F6FA", "F3FBFC", "1E282B", "BF0261"]:
            self.assertNotIn(retired, PALETTE)

    def test_accepts_brand_colors_fonts_and_punctuation_in_a_deck(self):
        slide = '<p:sld><a:rPr><a:solidFill><a:srgbClr val="10263F"/></a:solidFill><a:latin typeface="Lato"/></a:rPr><a:t>Applications grew, again.</a:t></p:sld>'
        path = write_package(self.directory, "deck.pptx", {"ppt/slides/slide1.xml": slide})
        self.assertEqual(check(path), [])

    def test_accepts_the_aptos_fallback(self):
        slide = '<p:sld><a:latin typeface="Aptos Narrow"/><a:latin typeface="Aptos"/><a:t>Demo day</a:t></p:sld>'
        path = write_package(self.directory, "deck.pptx", {"ppt/slides/slide1.xml": slide})
        self.assertEqual(check(path), [])

    def test_flags_other_colors_fonts_and_dashes_in_a_document(self):
        body = '<w:document><w:rFonts w:ascii="Comic Sans MS"/><w:color w:val="FF0000"/><w:t>Growth — fast</w:t></w:document>'
        path = write_package(self.directory, "memo.docx", {"word/document.xml": body})
        problems = check(path)
        self.assertTrue(any("FF0000" in problem for problem in problems))
        self.assertTrue(any("Comic Sans MS" in problem for problem in problems))
        self.assertTrue(any("dash" in problem for problem in problems))

    def test_names_retired_colors_and_fonts(self):
        body = '<w:document><w:rFonts w:ascii="Arial"/><w:color w:val="044451"/><w:t>Hello</w:t></w:document>'
        path = write_package(self.directory, "memo.docx", {"word/document.xml": body})
        problems = check(path)
        self.assertTrue(any("retired brand color" in problem and "Navy" in problem for problem in problems))
        self.assertTrue(any("Arial is retired" in problem for problem in problems))

    def test_allows_one_warm_accent_per_piece(self):
        one = '<p:sld><a:srgbClr val="FFC801"/><a:t>News</a:t></p:sld>'
        other = '<p:sld><a:srgbClr val="C6F135"/><a:t>Events</a:t></p:sld>'
        single = write_package(self.directory, "single.pptx", {"ppt/slides/slide1.xml": one})
        self.assertEqual(check(single), [])
        double = write_package(self.directory, "double.pptx", {"ppt/slides/slide1.xml": one, "ppt/slides/slide2.xml": other})
        self.assertTrue(any("more than one warm accent (Lime, Yellow)" in problem for problem in check(double)))

    def test_skips_the_inlined_propellant_stylesheet_in_html(self):
        page = write_page(
            self.directory,
            "<style>/* propellant-website.css start */ :root { --x: #123456; } /* propellant-website.css end */"
            " .card { color: #222222; font-family: 'Lato', sans-serif; }</style><h1>Hello</h1>",
        )
        self.assertEqual(check(page), [])

    def test_flags_off_brand_html(self):
        page = write_page(self.directory, "<style>.card { color: #ff00aa; font-family: Arial; }</style><p>Big – news</p>")
        self.assertEqual(len(check(page)), 3)

    def test_flags_two_warm_accents_in_html(self):
        page = write_page(self.directory, "<style>.tag { background: #FFC801; } .rule { border-color: #D14170; }</style><p>Hi</p>")
        self.assertEqual(len(check(page)), 1)


if __name__ == "__main__":
    unittest.main()

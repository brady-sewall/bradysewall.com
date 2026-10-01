#!/usr/bin/env python3
"""Submit the live sitemap after confirming the deployed ownership key."""
import argparse
import json
from pathlib import Path
import time
from urllib.request import Request, urlopen
from urllib.error import URLError
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

SITE = "https://bradysewall.com"
KEY_URL = SITE + "/indexnow-key.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
ROOT = Path(__file__).resolve().parents[1]


def payload(key, sitemap):
    urls = list(dict.fromkeys(node.text for node in ET.fromstring(sitemap).findall(
        "{http://www.sitemaps.org/schemas/sitemap/0.9}url/"
        "{http://www.sitemaps.org/schemas/sitemap/0.9}loc")))
    if not urls or len(urls) > 10000:
        raise ValueError("Sitemap must contain between 1 and 10,000 URLs")
    for url in urls:
        parts = urlsplit(url)
        if parts.scheme != "https" or parts.netloc != "bradysewall.com" or parts.fragment:
            raise ValueError("Sitemap URL must use the site's canonical HTTPS host")
    return dict(host="bradysewall.com", key=key, keyLocation=KEY_URL, urlList=urls)


def fetch(url):
    request = Request(url, headers={"User-Agent": "BradySewall-IndexNow/1.0"})
    with urlopen(request, timeout=10) as response:
        if response.geturl() != url:
            raise ValueError("Unexpected redirect: " + url)
        return response.read().decode("utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Validate local files without network requests")
    args = parser.parse_args()
    key = (ROOT / "docs/indexnow-key.txt").read_text().strip()
    if not (8 <= len(key) <= 128 and all(c.isascii() and (c.isalnum() or c == "-") for c in key)):
        raise ValueError("Invalid ownership key")
    if args.dry_run:
        data = payload(key, (ROOT / "docs/sitemap.xml").read_text())
        print("Dry run: valid key and " + str(len(data["urlList"])) + " canonical URLs; nothing submitted")
        return
    # Wait briefly for the deployed key to become visible through the CDN.
    for attempt in range(12):
        try:
            if fetch(KEY_URL).strip() == key:
                break
        except (URLError, TimeoutError):
            pass
        if attempt == 11:
            raise RuntimeError("Ownership key is not live yet; retry this workflow after deployment")
        time.sleep(10)
    data = payload(key, fetch(SITE + "/sitemap.xml"))
    request = Request(ENDPOINT, data=json.dumps(data).encode(), headers={
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "BradySewall-IndexNow/1.0"}, method="POST")
    with urlopen(request, timeout=30) as response:
        if response.status not in (200, 202):
            raise RuntimeError("Unexpected IndexNow response: " + str(response.status))
        print("IndexNow received " + str(len(data["urlList"])) + " URLs (HTTP " + str(response.status) + ")")
        print("Receipt does not guarantee crawling, indexing, or rankings.")


if __name__ == "__main__":
    main()

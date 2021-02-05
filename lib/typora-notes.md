**Typora** app on Ubuntu can export markdown to HTML file with style.

For font style, it uses loli.net server. Since this server is new to me, I replaced it with Google font server, more chance of being cached before, which leads to faster load.

Find (in exported HTML file)

```
https://fonts.loli.net/css?family=PT+Serif:400,400italic,700,700italic&subset=latin,cyrillic-ext,cyrillic,latin-ext
```
Replace with
```
https://fonts.googleapis.com/css?family=PT+Serif:400,400italic,700,700italic&subset=latin,cyrillic-ext,cyrillic,latin-ext
```

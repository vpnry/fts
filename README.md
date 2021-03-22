**Table of Contents**
[TOC]

## Dhamma Full Text Search Tool
+ Main address: [https://vpnry.github.io/fts](https://vpnry.github.io/fts)
+ [Open source code](https://github.com/vpnry/fts)

## Info

+ A  full text search tool for pāḷi tipiṭaka research and other Dhamma resources
+ It uses the power of SQlite3 fts5

## License

Some materials used in this app, such as the **PTS Pali English dictionary**, Roman pāḷi tipiṭaka text (VRI Roman version), etc... are for free distribution and non-commercial only.

Thus, this project should be released under this license:
```text
NonCommercial-ShareAlike 4.0 International (CC NC-SA 4.0)
```
## Acknowledgements

+ **Digital Pāḷi text version from VRI** 
Last time, we got a permission from VRI for using their digial pāḷi tipiṭaka text for free distribution with this attribution. So we also put it here for this project:

```
*********************************
This tipitaka digital text version copy right Vipassana Research Institute ("VRI"), Mumbai India.
Used by permission of VRI gratefully acknowledged.
*********************************
```


+ **Pali script converter** (paliScriptConverter.js):  from https://tipitaka.app used with author's permission.

```
/**
 * Copyright Path Nirvana 2018
 * The code and character mapping defined in this file can not be used for any commercial purposes.
 * Permission from the auther is required for all other purposes.
 */
```


+ **PTS PED dictionary**

PTS Pali-English Dictionary buddhadust_pts_ped.utf8.txt is obtained from [Buddhadust](http://buddhadust.net)


```

Corrected reprint © The Pali Text Society
Commercial Rights Reserved
Creative Commons Licence by-nc/3.0/

```

+ **Indexed Data source**

See the full file list in [README.html](lib/README.html)

| Name                     | Source                                                       |
| ------------------------ | :----------------------------------------------------------- |
| Pāḷi tipiṭaka text       | Divided into 2662 files by https://tipitaka.app (used digital pāḷi tipiṭaka text VRI version) |
| Pāḷi Dictionary          | + PTS PED buddhadust_pts_ped.utf8.tx from [Buddhadust](http://buddhadust.net)<br/><br/>+ Siongui/data Github [repository](https://github.com/siongui/data): <br/>vi-su-Pali_Viet_Abhi_Terms.tsv<br/>vi-su-Pali_Viet_Dictionary.tsv<br/>vi-su-Pali_Viet_Vinaya_Terms.tsv |
| Pa-Auk Meditation Manual | Some Pa-Auk Forest Monastery Meditation Manual eBooks [see file list](#appendix-data-file-list) |
|  Tam Tạng Pāḷi Việt     | A Vietnamese translation of tipiṭaka project (currently it is not finished all yet.) from **Tam Tang Pali Viet**, most files are retrieved from: https://tamtangpaliviet.net/TTPV/TTPV_BanDich.htm |
| Other databases | Some other miscellaneous databases like our personal e-books, Webster's Revised Unabridged Dictionary (1913) (this version is now in public domain) etc... which are big in file-size and may not be available on this online version. |

## Download for off-line use

+ Requirements: **PHP** server with SQLite3 **FTS5** extension enabled (a recent version of PHP should meet the requirements)

+ Download link(not available for public release yet): [this repository]( https://github.com/vpnry/dhammafts)

+ Note: Because of file size limitation, we zipped all .sqlite3 files in the /data folder repository. You need to unzip them before using. If you use Terminal command to unzip, can try this ` unzip -qq './data/*.zip' `,  do not make more folders.
+ So the data folder will contains something like this (& other files).:

```text
data
├── paaukmed.sqlite3
├── palidict.sqlite3
├── tptk.sqlite3
├── ttpv_budsas.net.sqlite3
...other files...
```

+ On Android, we can use **Termux** app with php and apache2 server packages. You can use any other ready made all-in-one PHP server apps as long as they supports  SQLite3 **FTS5** extension.

+ On iPad, we can use this app with **phpwin** app.

## Build Your Own Full Text Search Database

In general, to build a full text search app,  you need to do these steps:

+ `Step 1: gather documents into one place`
+ `Step 2: convert them into plain .txt files, do "data clean" etc.`
+ `Step 3: create an indexed database`
+ `Step 4: search UI or CLI for the indexed database`

### Here, for example, we will build a SQLite3 FTS5 powered full text search app:

#### Step 1: gather documents into one place`

+ When gathering data, you may want to check and remove duplicated files. On Ubuntu, we can use **FSlint** app to find duplicated files.


#### If you do not remove blank files and empty folders before indexing:

+ Your database may cause **"Internal Server Error"** (code 500) later.

+ So it is recommended that you do remove them before indexing.

#### To remove **empty** directories and blank files (*0 byte*)

+ We can use these commands in Terminal:

```bash
  # Find empty files
  find . -type f -size 0b -print 
  find . -type f -size 0b -delete
  
  # Find empty dirs
  find . -empty -type d -print
  find . -empty -type d -delete
```

The "." is current directory.

The first ones with *-print* are to list (dry run) items only, if you are OK with it, then use the next commands with the *-delete* option. It will delete the matched items.


#### Step 2: convert them into plain .txt files, perform "data clean" etc

+ System requirements: **python3**, **Java**

+ You can use `tika-app.jar` (download from https://tika.apache.org) to convert documents to txt files with batch mode.

```bash
 # Read Getting Started with Apache Tika 
 # from https://tika.apache.org for more info
java -jar tika-app.jar -t -i <inputDirectory> -o <outputDirectory>
```

+ The raw converted files are not good for indexing, you may need to run `prepare-textdata.py`  to clean these text files first. Check https://github.com/vpnry/dhammafts-dev-code for source code files.

```bash
  # This will help to fix broken lines
  python3 prepare-textdata.py
```

####  Step 3: create an indexed database

After you have successfully converted all of your documents into plain text files, you now can use `Apache Lucene` to create an index database, or in this case, we simply use **SQLite3 FTS5** to do so:

In the *Step 2* above, the converted txt files may contain broken lines, use `prepare-textdata.py`  to fix them (if you have not yet done):

```bash
python3 prepare-textdata.py
```
After that you can index them:
```bash
python3 index-all-others.py
```

#### Step 4: search UI or CLI for the indexed database

> Congrats! Nearly done! :) 

Now simply place your indexed databases to the directory `data`. And update their paths in the `index.php` file. Find the follow line and update it accordingly to your cases.

```php
$dbConnection = new SQLite3("data/tptk.sqlite3");
```

## Appendix: Data file list

+ We deployed this app on Heroku with a free account. Due to storage limitation, not all available resources are indexed for this public release. Here are indexed-file lists:

+ **Pa-Auk Meditation Manual eBooks**

```text
  paaukmed/
  ├── 01 Samatha and Rupa(A5).pdf
  ├── 02 Nama (newFont14.5.11)(A4).pdf
  ├── 03 Patticca(5thMethod)(newFont14.5.11).pdf
  ├── 04 Paticca (1st Method)(new font14.5.11).pdf
  ├── 05 PATHANA (new font14.5.11) 3.pdf
  ├── 06 CFMP(LakkhanaRasa)(2011).pdf
  ├── 07 Vipassana(all) (newFont14.5.11)3.pdf
  ├── 14 Ways En-Ch.pdf
  ├── 14 Ways Singhalese.pdf
  ├── NUTRIMENT- BORN MATERIALITY.pdf
  ├── Nutriment-born(Revised19.12.2012)5(Lg+A4).pdf
  ├── Recollection of Past Lives by Abhinna Etc.pdf
  └── Rupa+Nama Tables (all) 10.pdf
  
  0 directories, 14 files
  
```

+ **Tam Tang Pali Viet (CÁC BẢN DỊCH CỦA TỲ KHƯU INDACANDA, PhD) bilingual Pāḷi-Việt**

```text
ttpv/
├── 28_Khp-Dh-Ud-It.pdf
├── 29_Sn.pdf
├── 30_Vv_Pv.pdf
├── 31_Thag_Thig.pdf
├── 32_Ja_I.pdf
├── 33_Ja_II.pdf
├── 34_Ja_III.pdf
├── 35_Nidd_I.pdf
├── 36_Nidd_II.pdf
├── 45_Mil.pdf
├── Indacanda - Kinh Tung Pali Le Bai Tam Bao.pdf
├── ttpv_01_Pr.pdf
├── ttpv_02_Pc_I.pdf
├── ttpv_03_Pc_II.pdf
├── ttpv_04_Mv_I.pdf
├── ttpv_05_Mv_II.pdf
├── ttpv_06_Cv_I.pdf
├── ttpv_07_Cv_II.pdf
├── ttpv_08_Par_I.pdf
├── ttpv_09_Par_II.pdf
├── ttpv_37_Pts_I.pdf
├── ttpv_38_Pts_II.pdf
├── ttpv_39_Ap_I.pdf
├── ttpv_40_Ap_II.pdf
├── ttpv_41_Ap_III.pdf
├── ttpv_42_Bv&Cp.pdf
└── ttpv_bkn_ptm Gioi Bon Tkn.pdf

0 directories, 27 files

```




## Feedback

+ If you have any suggestions or found bugs, you can provide feedback here on [**Google Form**](https://forms.gle/1FzEVDYajhNXSkad7).

May we all be able to understand and practise the Dhamma correctly, quickly.
May you all be well and happy!

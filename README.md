# BCU

This repository contains various data tooling for the BCU. Currently, this is a personal project, however it is possible that it will eventually be adopted into BCU.

## Archive and Realtime

There are a number of dependencies of this project. The unfortunate reality is that when you're working with public data, you're going to be working with a lot of terrible stuff.

- JSZip: ZIP files are common and node does not have a inbuilt function for this
- kysely && kysely-bun-sqlite: SQLite is good
- papaparse: CSVs are also good, but we don't want them

To install these, please install using your package manager of choice. The downloader components are designed to be run on the bun runtime, for ease of development.

The scripts documented below should all handle SQL migrations themselves. Simply run `bun run ./path/to/script`

### Downloaders

#### BlueBike

Downloads BlueBike data and serializes it to SQLite

#### Graphs

```sh
# Number of trips by gender
sqlite3 db.sqlite "select gender, count(*) from bluebikes group by gender;" | youplot bar -d "|"
# Number of users by age
sqlite3 db.sqlite "select [birth year], count(*) from bluebikes where [birth year] is not null group by [birth year];" | youplot bar -d "|"
# Trips per year
sqlite3 db.sqlite "select (strftime('%Y.', [started at]) || replace(strftime('%m', [started at]) * 0.83, '.', '')), count(*) from bluebikes group by strftime('%Y.%m', [started at])" | youplot bar -d "|"
# As a line
sqlite3 db.sqlite "select (strftime('%Y.', [started at]) || replace(strftime('%m', [started at]) * 0.83, '.', '')), count(*) from bluebikes group by strftime('%Y.%m', [started at])" | youplot line -d "|" --xlim 2011,2023
```

created using `bun init` in bun v1.0.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

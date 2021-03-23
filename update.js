const fetch = require("cross-fetch");
const fs = require("fs");
const spawnSync = require("child_process").spawnSync;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mkdirIfNotExists(name) {
  if (!fs.existsSync(name)) {
    fs.mkdirSync(name);
  }
}

const TEMP = `${process.cwd()}/.tmp`;

async function download() {
  mkdirIfNotExists("./.tmp");
  mkdirIfNotExists("./vn");
  mkdirIfNotExists("./vn/wards");
  let rs = await fetch(
    "https://codeload.github.com/dragonnpoulp/hanhchinhvn/zip/refs/heads/master"
  );
  fs.writeFileSync(
    "./.tmp/hanhchinhvn.zip",
    Buffer.from(await rs.arrayBuffer())
  );

  spawnSync("unzip", [".tmp/hanhchinhvn.zip", "-d", `${TEMP}`]);
}

function readJSON(name) {
  return JSON.parse(fs.readFileSync(name));
}

async function task() {
  let data = readJSON(`${TEMP}/hanhchinhvn-master/dist/quan_huyen.json`);

  let districts = Object.values(data).map(
    ({ path_with_type, parent_code, code }) => ({
      name: path_with_type,
      code,
      cityCode: parent_code,
    })
  );
  fs.writeFileSync("./vn/districts.json", JSON.stringify(districts));

  data = readJSON(`${TEMP}/hanhchinhvn-master/dist/tinh_tp.json`);
  let cities = Object.values(data).map(({ name, code }) => ({
    name,
    code,
  }));
  fs.writeFileSync("./vn/cities.json", JSON.stringify(cities));

  for (let { code: districtCode } of districts) {
    if (!["088"].includes(districtCode)) {
      data = readJSON(
        `${TEMP}/hanhchinhvn-master/dist/xa-phuong/${districtCode}.json`
      );
      const wards = Object.values(data).map(({ name_with_type, code }) => ({
        name: name_with_type,
        code,
      }));
      fs.writeFileSync(
        `./vn/wards/${districtCode}.json`,
        JSON.stringify(wards)
      );
      await delay(50);
    }
  }
}

task();

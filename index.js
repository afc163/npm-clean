#!/usr/bin/env node

var iterateFiles = require("iterate-files")
var requires = require('searequire')
var array = require("array-extended")
var fs = require('fs')
var path = require('path')
var pkgFile = path.join(process.cwd(), 'package.json')
var pkg = require(pkgFile)
var dependencies = Object.keys(pkg.dependencies || {})
var actuallyDeps = []

// Load all javascript files in the test folder or any of their sub folders
iterateFiles(process.cwd(), function (fileName) {
  // run code for each recursively found js file
  if (fileName.indexOf('node_modules') >= 0) {
    return;
  }
  var reqs = requires(fs.readFileSync(fileName).toString())
  actuallyDeps = actuallyDeps.concat(reqs.map(function(r) {
    return r.path
  }))
}, function (err) {
  var unused = array.difference(dependencies, actuallyDeps)
  if (unused.length > 0) {
    unused.forEach(function(item) {
      // no remove grunt and gulp plugins
      if (item.indexOf('grunt-') >= 0 || item.indexOf('gulp-') >= 0) {
        return
      }
      console.log('Clean unused dependency: ' + item)
      delete pkg.dependencies[item]
    })
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2))
  }
})

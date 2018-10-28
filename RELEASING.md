Releasing
=========

There're no particular rules about when to release alexa-app. Release bug fixes frequently, features not so frequently and breaking API changes rarely.

### Release

Run tests, check that all tests succeed locally.

```
npm install
npm test
npm install dtslint@^0.2
npm run dtslint
```

Check that the last build succeeded in [Travis CI](https://travis-ci.org/alexa-js/alexa-app).

Those with r/w permissions to the [master alexa-app repository](https://github.com/alexa-js/alexa-app) generally have alexa-app-based projects. Point one to alexa-app HEAD and run all your tests to catch any obvious regressions.

```
"dependencies": {
  "alexa-app": "alexa-js/alexa-app"
}
```

Modify the "Stable Release" section in [README.md](README.md). Change the text to reflect that this is going to be the documentation for a stable release. Remove references to the previous release of alexa-app. Keep the file open, you'll have to undo this change after the release.

```
## Stable Release

You're reading the documentation for the stable release of alexa-app, 2.4.0.
```

Change "Next Release" in [CHANGELOG.md](CHANGELOG.md) to the new version.

```
#### 2.4.0 (1/5/2016)
```

Remove the line with "Your contribution here.", since there will be no more contributions to this release.

Commit your changes.

```
git add README.md CHANGELOG.md
git commit -m "Preparing for release, 2.4.0."
```

Tag the release.

```
git tag v2.4.0
```

Release.

```
$ npm publish
```

Push.

```
$ git push --tags
```

### Prepare for the Next Developer Iteration

Modify the "Stable Release" section in [README.md](README.md). Change the text to reflect that this is going to be the next release.

```
## Stable Release

You're reading the documentation for the next release of alexa-app, which should be 2.4.1.
The current stable release is [2.4.0](https://github.com/alexa-js/alexa-app/blob/v2.4.0/README.md).
```

Add the next release to [CHANGELOG.md](CHANGELOG.md).

```
#### 2.4.1 (Next)

* Your contribution here.
```

Bump the minor version in package.json.

Commit your changes.

```
git add CHANGELOG.md README.md package.json
git commit -m "Preparing for next development iteration, 2.4.1."
git push origin master
```

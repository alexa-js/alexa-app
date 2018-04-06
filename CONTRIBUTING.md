# Contributing to alexa-app

You're encouraged to submit [pull requests](https://github.com/alexa-js/alexa-app/pulls), [propose features and discuss issues](https://github.com/alexa-js/alexa-app/issues).

In the examples below, substitute your Github username for `contributor` in URLs.

### Fork the Project

Fork the [project on Github](https://github.com/alexa-js/alexa-app) and check out your copy.

```
git clone https://github.com/contributor/alexa-app.git
cd alexa-app
git remote add upstream https://github.com/alexa-js/alexa-app.git
```

### Run Tests

Ensure that you can build the project and run tests.

```
npm install
npm test
```

## Contribute Code

### Create a Topic Branch

Make sure your fork is up-to-date and create a topic branch for your feature or bug fix.

```
git checkout master
git pull upstream master
git checkout -b my-feature-branch
```

### Write Tests

Try to write a test that reproduces the problem you're trying to fix or describes a feature that you want to build. Tests live under [test](test).

We definitely appreciate pull requests that highlight or reproduce a problem, even without a fix.

### Write Code

Implement your feature or bug fix.

Make sure that `npm test` completes without errors.

### Update Type Definitions

If you've modified the public API at all, you should update the TypeScript definition file `types/index.d.ts`.

You can run the TypeScript linter to verify your changes:

```
npm install
npm run dtslint
```

This will also run the TypeScript type checker on all of the unit tests (even though they're in JavaScript!) to make sure that reality matches the type definitions. This may fail, possibly with an error that there's some type ambiguity, which might mean you need to tweak the tests a bit to give TypeScript the info it needs. If you're having trouble with this, you may want to look at other tests in this project to see workarounds for similar problems, or barring that feel free to bug [@lazerwalker](https://github.com/lazerwalker).

### Write Documentation

Document any external behavior in the [README](README.md).

### Commit Changes

Make sure git knows your name and email address:

```
git config --global user.name "Your Name"
git config --global user.email "contributor@example.com"
```

Writing good commit logs is important. A commit log should describe what changed and why.

```
git add ...
git commit
```

### Push

```
git push origin my-feature-branch
```

### Make a Pull Request

Go to https://github.com/alexa-js/alexa-app and select your feature branch. Click the 'Pull Request' button and fill out the form. Pull requests are usually reviewed within a few days.

Add more commits or amend your previous commit with any changes.

Once you have a pull request number add a commit to record your change in the CHANGELOG.md, don't worry if you forget, Travis-CI will remind you :)

```
git commit --amend
git push origin my-feature-branch -f
```

### Rebase

If you've been working on a change for a while, rebase with upstream/master.

```
git fetch upstream
git rebase upstream/master
git push origin my-feature-branch -f
```

### Check on Your Pull Request

Go back to your pull request after a few minutes and see whether it passed muster with Travis-CI. Everything should look green, otherwise fix issues and amend your commit as described above.

### Be Patient

It's likely that your change will not be merged and that the nitpicky maintainers will ask you to do more, or fix seemingly benign problems. Hang on there!

## Thank You

Please do know that we really appreciate and value your time and work. We love you, really.

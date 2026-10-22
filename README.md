# Matchday 0816

A small browser invitation built as a sequence of interactive choices.

## Implementation

- Separates invitation state and selection rules from DOM rendering.
- Uses constrained button movement and step transitions for the invitation flow.
- Runs as static HTML, CSS, and JavaScript without a build step.

The content and fixed date belong to a personal invitation; this is not a general scheduling service.

[State rules](logic.mjs) · [DOM behavior](app.js) · [Logic tests](tests/logic.test.mjs)

## Run

From the repository root, with Python installed:

```sh
python -m http.server 4174 --bind 127.0.0.1
```

Open [localhost:4174](http://127.0.0.1:4174).

## Validation

With Node.js installed:

```sh
npm test
npm run check
```

The Node test suite covers the fixed date, challenge progression, input handling, and button movement bounds. The check script validates JavaScript syntax.

## License

No separate public license is specified.

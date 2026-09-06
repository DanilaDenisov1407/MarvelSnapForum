name: Update Marvel Snap Cards

on:
  workflow_dispatch:
  schedule:
    - cron: "0 20 * * *"

permissions:
  contents: write

jobs:
  update-cards:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: '20'

      - name: Update cards
        run: node BlackJackSnap/scripts/update-cards.js

      - name: Commit changes
        run: |
          git config user.name "Marvel Snap Bot"
          git config user.email "bot@github.com"

          git add BlackJackSnap/data/cards.json

          git diff --cached --quiet || (
            git commit -m "Update Marvel Snap cards"
            git push
          )

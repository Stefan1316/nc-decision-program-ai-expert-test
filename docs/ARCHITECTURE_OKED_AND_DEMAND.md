# NC Decision — OKED master, financing fallback and demand intelligence

## 1. Canonical OKED layer
The canonical classifier is kept independently from program eligibility.

Official source:
- Bureau of National Statistics of Kazakhstan
- Classifier: ОКЭД НК РК 03-2019
- Effective from 2020-01-01
- Official classifier page: https://stat.gov.kz/ru/classifiers/statistical/21/
- Machine-readable JSON is synchronized by GitHub Actions.

The master directory describes the economic activity only. It does **not** mark an OKED as globally priority/non-priority.

## 2. Program adapters
Every financing/support program owns its own eligibility semantics:
- exact
- hierarchy
- ranges/exclusions
- geography
- amount
- purpose
- entity/business status
- instrument-specific constraints

A match in one adapter must never leak into another adapter.

## 3. Fallback financing route
When no concessionary financing is confirmed, NC Decision must not return an empty result.

Fallback:
1. commercial bank financing (rate determined by the bank; never invented by NC Decision);
2. Damu guarantee check if collateral is insufficient;
3. commercial leasing when relevant;
4. other regional/institutional routes as adapters are added.

Guarantee and subsidized rate are separate dimensions.

## 4. Demand analytics — future stage
Every analysis will later contribute a de-identified aggregate event:
- OKED
- region/district
- purpose
- amount band
- result class

No IIN/BIN, name, phone or other direct identifier is required for the demand event.

Use cases:
- demand by OKED and territory;
- unmet demand where no concessionary program exists;
- marketing prioritization;
- evidence for policy/collegial proposals to akimats and public bodies to add or amend priority activities.

The event schema exists now, but storage/transmission is intentionally not activated until the base decision logic is accepted.

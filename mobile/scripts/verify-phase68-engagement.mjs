import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

function loadTypeScriptModule(relativePath, runtimeImports = {}) {
  const sourceUrl = new URL(relativePath, import.meta.url);
  const source = fs.readFileSync(fileURLToPath(sourceUrl), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: relativePath,
  });
  const loadedModule = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    Date,
    Intl,
    exports: loadedModule.exports,
    module: loadedModule,
    require(specifier) {
      if (specifier in runtimeImports) return runtimeImports[specifier];
      throw new Error(`Unexpected runtime import in ${relativePath}: ${specifier}`);
    },
  });
  return loadedModule.exports;
}

const module = {
  exports: loadTypeScriptModule('../src/features/engagement/progression.ts'),
};

const { buildEngagementSnapshot, getRescueRank } = module.exports;
assert.equal(typeof buildEngagementSnapshot, 'function');
assert.equal(typeof getRescueRank, 'function');

const collection = (id, verifiedAt, pointsAwarded = 0) => ({
  id,
  foodDropId: `drop-${id}`,
  userId: 'test-user',
  title: 'Test FoodDrop',
  venueName: 'Test venue',
  verifiedAt,
  quantity: 1,
  pointsAwarded,
});

const sundayMorningSingapore = new Date('2026-08-30T02:00:00.000Z');
const history = [
  collection('sunday', '2026-08-30T01:00:00.000Z', 100),
  collection('saturday', '2026-08-29T04:00:00.000Z'),
  collection('monday-midnight', '2026-08-23T16:00:00.000Z'),
  collection('previous-sunday', '2026-08-23T15:59:59.000Z'),
];

const active = buildEngagementSnapshot(history, 7, 2, sundayMorningSingapore);
assert.equal(active.rank.name, 'PorsiPal Guardian');
assert.equal(active.nextRank.name, 'Campus Comet');
assert.equal(active.weeklyRescues, 3, 'Monday midnight must count; prior Sunday must not');
assert.equal(active.weeklyProgress, 1);
assert.equal(active.dailyBonusClaimed, true);
assert.equal(active.badges.find((badge) => badge.id === 'first-catch').unlocked, true);
assert.equal(active.badges.find((badge) => badge.id === 'week-in-orbit').unlocked, true);
assert.equal(active.badges.find((badge) => badge.id === 'streak-spark').unlocked, true);

const newcomer = buildEngagementSnapshot([], 0, 0, sundayMorningSingapore);
assert.equal(newcomer.rank.name, 'Meteor Newcomer');
assert.equal(newcomer.weeklyRescues, 0);
assert.equal(newcomer.dailyBonusClaimed, false);
assert.equal(newcomer.badges.every((badge) => !badge.unlocked), true);

assert.equal(getRescueRank(-5).name, 'Meteor Newcomer');
assert.equal(getRescueRank(1).name, 'Drop Catcher');
assert.equal(getRescueRank(3).name, 'Meteor Scout');
assert.equal(getRescueRank(15).name, 'Campus Comet');
assert.equal(getRescueRank(30).name, 'Rescue Legend');

const sharedPayloads = [];
const shareModule = loadTypeScriptModule('../src/features/engagement/share-rescue.ts', {
  'react-native': {
    Share: {
      async share(payload) {
        sharedPayloads.push(payload);
        return { action: 'sharedAction' };
      },
    },
  },
});

await shareModule.shareVerifiedRescue({
  code: 'success',
  foodDropId: 'private-drop-id',
  collectionId: 'private-collection-id',
  remainingStock: 2,
  pointsAwarded: 100,
  currentStreak: 2,
});
await shareModule.shareVerifiedRescue({
  code: 'duplicate_collection',
  foodDropId: 'private-drop-id',
  collectionId: null,
  remainingStock: 2,
  pointsAwarded: 0,
  currentStreak: 2,
});
await shareModule.shareRescueProgress({
  displayName: 'Darry',
  mealsRescued: 7,
  rankName: 'PorsiPal Guardian',
  currentStreak: 2,
});

assert.equal(sharedPayloads.length, 2, 'A failed collection must not open sharing');
assert.match(sharedPayloads[0].message, /100 rescue points/);
assert.match(sharedPayloads[1].message, /Darry/);
assert.match(sharedPayloads[1].message, /7 verified surplus meals/);
for (const payload of sharedPayloads) {
  assert.doesNotMatch(
    payload.message,
    /private-drop-id|private-collection-id|venue|latitude|longitude|watch zone|QR payload/i,
  );
}

console.log(
  'Phase 6-8 engagement verification passed: Singapore time, missions, ranks, badges, and privacy-safe sharing.',
);

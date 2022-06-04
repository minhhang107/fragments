const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');
// const MemoryDB = require('../../src/model/data/memory/memory-db');

describe('fragment data', () => {
  const metadata = {
    id: '1',
    ownerId: 'user1',
  };
  test('writeFragment() returns nothing', async () => {
    const result = await writeFragment(metadata);
    expect(result).toBe(undefined);
  });

  test('readFragment() returns what writeFragment() saves into db', async () => {
    await writeFragment(metadata);
    const result = await readFragment(metadata.ownerId, metadata.id);
    expect(result).toEqual(metadata);
  });

  test('readFragmentData() returns what writeFragmentData() saves into db', async () => {
    const value = Buffer.from('file 1');

    await writeFragmentData(metadata.ownerId, metadata.id, value);
    const result = await readFragmentData(metadata.ownerId, metadata.id);
    expect(result).toEqual(value);
  });

  test('readFragmentData() with incorrect id returns nothing', async () => {
    const value = Buffer.from('file 1');

    await writeFragmentData(metadata.ownerId, metadata.id, value);
    const result = await readFragmentData(metadata.ownerId, '2');
    expect(result).toBe(undefined);
  });

  test('listFragments() returns empty array when ownerId not existed', async () => {
    const results = await listFragments('user2', true);
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual([]);
  });

  test('listFragments() returns objects when expanded', async () => {
    const metadata2 = {
      id: '2',
      ownerId: 'user1',
    };

    const metadata3 = {
      id: '3',
      ownerId: 'user1',
    };

    await writeFragment(metadata);
    await writeFragment(metadata2);
    await writeFragment(metadata3);

    const results = await listFragments('user1', true);
    expect(results).toEqual([metadata, metadata2, metadata3]);
  });

  test('listFragments() returns only ids when not expanded', async () => {
    const metadata2 = {
      id: '2',
      ownerId: 'user1',
    };

    const metadata3 = {
      id: '3',
      ownerId: 'user1',
    };

    await writeFragment(metadata);
    await writeFragment(metadata2);
    await writeFragment(metadata3);

    const results = await listFragments('user1', false);
    expect(results).toEqual([metadata.id, metadata2.id, metadata3.id]);
  });

  test('deleteFragment() removes both the metadata and data', async () => {
    const value = Buffer.from('file 1');

    await writeFragment(metadata);
    await writeFragmentData(metadata.ownerId, metadata.id, value);

    await deleteFragment(metadata.ownerId, metadata.id);

    const metadataResult = await readFragment(metadata.ownerId, metadata.id);
    expect(metadataResult).toBe(undefined);

    const dataResult = await readFragmentData(metadata.ownerId, metadata.id);
    expect(dataResult).toBe(undefined);
  });
});

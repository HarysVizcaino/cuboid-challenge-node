import Bag from '../Bag';
import Cuboid from '../Cuboid';

let bag: Bag;

jest.mock('../Bag', () => {
  const originalModule = jest.requireActual('../Bag');
  return {
    __esModule: true,
    ...originalModule,
    default: {
      query: () => ({
        insertGraphAndFetch: async (obj: any) => Promise.resolve(obj),
      }),
      relationMappings: {
        cuboids: {},
      },
    },
  };
});


jest.mock('../Cuboid', () => {
  const originalModule = jest.requireActual('../Cuboid');
  return {
    __esModule: true,
    ...originalModule,
    default: {
      relationMappings: {
        bag: {},
      },
      query: () => ({
        insert: async (obj: any) => {
          const volume = obj.width * obj.height * obj.depth;
          return Promise.resolve({ ...obj, volume });
        },
      }),
    },
  };
});

beforeAll(async () => {
  bag = await Bag.query().insertGraphAndFetch({
    volume: 100,
    title: 'A bag',
    cuboids: [{ width: 2, height: 2, depth: 2 }],
  });
});

describe.each([
  [3, 3, 3, 27],
  [4, 4, 4, 64],
])('Cuboid %i x %i x %i', (width, height, depth, volume) => {
  let cuboid: Cuboid;

  beforeAll(async () => {
    cuboid = await Cuboid.query().insert({
      width,
      height,
      depth,
      bagId: bag.id,
    });
  });

  it('should have dimensions', () => {
    expect(cuboid.width).toBe(width);
    expect(cuboid.height).toBe(height);
    expect(cuboid.depth).toBe(depth);
  });

  it('should have volume', () => {
    expect(cuboid.volume).toBe(volume);
  });
});

it('should have relation mapping', () => {
  expect(Cuboid.relationMappings).toHaveProperty('bag');
});

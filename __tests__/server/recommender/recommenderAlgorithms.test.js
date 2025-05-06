// ⬅️ Automatically replaces the real DB functions with mocks
jest.mock('../../../server/recommender/recommenderAlgorithmsServer.js', () => ({
    getUserFiltersDB: jest.fn(),
    getSpecificItemFiltersDB: jest.fn(),
    getAllItemFiltersDB: jest.fn()
}));

import {
    getUserFiltersDB,
    getSpecificItemFiltersDB,
    getAllItemFiltersDB
} from '../../../server/recommender/recommenderAlgorithmsServer.js';
  
import { recommenderAlgorithmForUser } from '../../../server/recommender/recommenderAlgorithms.js';
  
beforeEach(() => {
    const mockArray = Array.from({ length: 15 }, () => Math.floor(Math.random() * 100));
  
    getUserFiltersDB.mockResolvedValue(mockArray);
    getSpecificItemFiltersDB.mockResolvedValue(mockArray);
    getAllItemFiltersDB.mockResolvedValue([mockArray]);
  });
  

test("recommenderAlgorithmForUser returns two arrays of 15 numbers", async () => {
    const userId = 123;
    const result = await recommenderAlgorithmForUser(userId);
  
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  
    result.forEach(array => {
      expect(Array.isArray(array)).toBe(true);
      expect(array).toHaveLength(15);
      array.forEach(item => {
        expect(typeof item).toBe("number");
      });
    });
  });
  
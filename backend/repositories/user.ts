import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user';
@EntityRepository(User)
class UserRepository extends Repository<User> {
  findByName(firstName: string) {
    return this.findOne({ where: { name: firstName } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new Error('ERR_USER_NOT_FOUND');
    return user;
  }

  async findAll(): Promise<User[]> {
    // TODO: handle pagination
    return await this.find();
  }
}

export default UserRepository;
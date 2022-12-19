import { prisma } from '../src/lib/db.server';
import { hashPassword } from '../src/utils/passwordHash';

const main = async () => {
  const newUser = await prisma.user.create({
    data: {
      email: 'test@gmail.com',
      phoneNumber: '0979609500',
      name: 'test',
      password: await hashPassword('123456'),
    },
  });

  console.log(newUser);
  
};

main()
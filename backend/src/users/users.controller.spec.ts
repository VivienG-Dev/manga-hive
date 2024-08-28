import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [
        {
          id: 1,
          username: 'Toto',
          email: 'toto@toto.com',
          password: '123456',
          googleId: null,
          emailVerificationToken: null,
          emailVerified: false,
          passwordResetToken: null,
          passwordResetExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          libraryEntries: [],
        },
      ];
      usersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(usersService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const result = {
        id: 1,
        username: 'Toto',
        email: 'toto@toto.com',
        password: '123456',
        googleId: null,
        emailVerificationToken: null,
        emailVerified: false,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        libraryEntries: [],
      };
      usersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it("should update a user's username", async () => {
      const userDto: Partial<UserDto> = {
        username: 'NewUsername',
      };
      const updatedUser = {
        id: 1,
        username: 'NewUsername',
        password: '123456',
        email: 'toto@toto.com',
        imageUrl: 'image-url.jpg',
        googleId: null,
        emailVerificationToken: null,
        emailVerified: false,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        libraryEntries: [],
      };

      usersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', userDto);

      expect(result).toBe(updatedUser);
      expect(usersService.update).toHaveBeenCalledTimes(1);
      expect(usersService.update).toHaveBeenCalledWith(1, userDto);
    });

    it("should update a user's password", async () => {
      const userDto: Partial<UserDto> = {
        password: 'NewPassword123!',
      };
      const updatedUser = {
        id: 1,
        username: 'NewUsername',
        password: 'NewPassword123!',
        email: 'toto@toto.com',
        imageUrl: 'image-url.jpg',
        googleId: null,
        emailVerificationToken: null,
        emailVerified: false,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        libraryEntries: [],
      };

      usersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', userDto);

      expect(result).toBe(updatedUser);
      expect(usersService.update).toHaveBeenCalledTimes(1);
      expect(usersService.update).toHaveBeenCalledWith(1, userDto);
    });

    it("should update a user's image", async () => {
      const userDto: Partial<UserDto> = {
        imageUrl: 'new-image-url.jpg',
      };
      const updatedUser = {
        id: 1,
        username: 'Toto',
        email: 'toto@toto.com',
        imageUrl: 'new-image-url.jpg',
        password: '123456',
        googleId: null,
        emailVerificationToken: null,
        emailVerified: false,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        libraryEntries: [],
      };

      usersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', userDto);

      expect(result).toBe(updatedUser);
      expect(usersService.update).toHaveBeenCalledTimes(1);
      expect(usersService.update).toHaveBeenCalledWith(1, userDto);
    });
  });
});

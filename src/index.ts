import "reflect-metadata";
import { createConnection } from "typeorm";
import * as entity from "./entity";
import express, { Application } from "express";
import bodyParser from "body-parser";
import { FindManyOptions, getRepository, Repository } from "typeorm";
import cors from "cors";

const connection = createConnection({
  type: "mysql",
  host: "localhost",
  port: 3333,
  username: "root",
  password: "testpass",
  database: "test",
  entities: entity.entities,
  synchronize: true,
  logging: "all",
});

const app = express();
app.listen(3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let repository: Repository<entity.User | entity.Book>;

function setRepository<T extends entity.entity_name_t>(
  entityName: string
): Repository<entity.entity_map_t[T]> {
  return getRepository<entity.entity_map_t[T]>(entityName);
}

app.post("/", (req: express.Request, res: express.Response) => {
  const entity: string = req.body.entity;
  repository = setRepository(entity);
  const query: FindManyOptions = req.body.query;
  const _length = repository.count();
  const _body = repository.find(query);
  Promise.all([_length, _body])
    .then(([length, body]) => {
      res.send({ length, body });
    })
    .catch((err) => {
      res.send(err);
    });
});

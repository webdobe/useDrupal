/**
 * The Attributes interface serves as a generic key-value store for entity attributes.
 */
export interface IAttributes {
  [key: string]: any;
}

/**
 * The Relationship interface represents the data of a relationship in an entity.
 */
export interface IRelationship {
  data: any;
}

/**
 * The Relationships interface serves as a generic key-value store for entity relationships.
 */
export interface IRelationships {
  [key: string]: IRelationship;
}

/**
 * The MetaData interface represents the data of a metadata in an entity.
 */
export interface IMetaData {
  data: any;
}

/**
 * The Meta interface serves as a generic key-value store for entity metadata.
 */
export interface IMeta {
  [key: string]: IMetaData;
}

/**
 * The Entity interface describes the structure of an entity.
 */
export interface IEntity {
  id: string;
  type: string;
  attributes?: IAttributes;
  relationships?: IRelationships;
  meta?: IMeta;
}

/**
 * The EntityData interface represents a key-value store where each key is a type
 * and each value is an object where each key is an ID and each value is an Entity.
 */
export interface IEntityData {
  [key: string]: { [key: string]: IEntity };
}

/**
 * The DrupalEntity class represents a Drupal entity.
 */
class JsonApiEntity {
  _id?: string;
  _type: string;
  _data?: IEntityData | {};
  _index: number;

  /**
   * The constructor takes an id, type, and optionally a data object.
   */
  constructor(id: string, type: string, data?: IEntityData | {}, entityIndex: number = 0) {
    this._id = id;
    this._type = type;
    this._data = data;
    this._index = entityIndex;

    if (!id && data) {
      this.getEntityByType();
    }
  }

  // Getter and Setter for id
  set id (id) {
    this._id = id;
  }

  get id () {
    return this._id;
  }

  // Getter and Setter for type
  set type (type) {
    this._type = type;
  }

  get type () {
    return this._type;
  }

  // Getter and Setter for data
  set data(value: IEntityData | {} | undefined) {
    if (value === undefined || Object.keys(value).length === 0) {
      this._data = {};
    } else {
      this._data = value as IEntityData;
      this.getEntityByType();
    }
  }

  get data() {
    return this._data;
  }

  // Getter for values;
  get values() {
    if(this.data && this.type && this.id && (this.data as IEntityData)?.[this.type]?.[this.id]) {
      const entity: IEntity = (this.data as IEntityData)[this.type][this.id];
      return entity;
    }
    return undefined;
  }

  /**
   * The getEntityByType method is used to update the id and type of the current entity based on its type.
   */
  getEntityByType () {
    if(this.data && this.type && (this.data as IEntityData)?.[this.type]) {
      const entity: IEntity = Object.values((this.data as IEntityData)[this.type])[this._index] as IEntity;
      if (entity) {
        this.id = entity.id;
        this.type = entity.type;
      }
    }
  }

  /**
   * The getValue method is used to retrieve the value of a given attribute or relationship.
   */
  getValue(value: string): any {
    if(this.data && this.type && this.id && (this.data as IEntityData)?.[this.type]?.[this.id]) {
      const entity: IEntity = (this.data as IEntityData)[this.type][this.id];
      if (entity) {
        if (entity.attributes && entity.attributes[value] !== undefined) {
          return entity.attributes[value];
        } else if (entity.relationships && entity.relationships[value]) {
          return this.getRelationship(value);
        }
      }
    }
    return undefined;
  }

  /**
   * The getValue method is used to retrieve the value of a given attribute or relationship.
   */
  setValue(attribute: string, value: any): any {
    if(this.data && this.type && this.id && (this.data as IEntityData)?.[this.type]?.[this.id]) {
      const entity: IEntity = (this.data as IEntityData)[this.type][this.id];
      if (entity) {
        const data = JSON.parse(JSON.stringify(this.data));
        data[this.type][this.id]['attributes'][attribute] = value;
        this.data = data;
      }
    }
  }

  /**
   * The getRelationship method is used to retrieve a relationship as a DrupalEntity or an array of DrupalEntities.
   */
  getRelationship(value: string): JsonApiEntity | JsonApiEntity[] | undefined {
    if(this.data && this.type && this.id && (this.data as IEntityData)?.[this.type]?.[this.id]) {
      const entity: IEntity = (this.data as IEntityData)[this.type][this.id];
      if (entity && entity.relationships && entity.relationships[value]?.data) {
        const relationshipData = entity.relationships[value].data;
        if (relationshipData) {
          if (Array.isArray(relationshipData)) {
            return relationshipData.map((item) => new JsonApiEntity(item.id, item.type, this.data));
          } else {
            return new JsonApiEntity(relationshipData.id, relationshipData.type, this.data);
          }
        }
      }
    }
    return undefined;
  }

  /**
   * The getMeta method is used to retrieve the value of a given meta data.
   */
  getMeta(value: string): any {
    if(this.data && this.type && this.id && (this.data as IEntityData)?.[this.type]?.[this.id]) {
      const entity: IEntity = (this.data as IEntityData)[this.type][this.id];
      if (entity && entity.meta && entity.meta[value]) {
        return entity.meta[value];
      }
    }
    return undefined;
  }
};

export default JsonApiEntity;
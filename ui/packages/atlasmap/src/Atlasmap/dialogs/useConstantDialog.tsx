/*
    Copyright (C) 2017 Red Hat, Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
import { ConstantDialog, IConstant } from '../../UI';
import React, { ReactElement, useCallback, useState } from 'react';

import { IAtlasmapDocument } from '../../Views';
import { constantTypes } from '@atlasmap/core';
import { useToggle } from '../../Atlasmap/utils';

type ConstantCallback = (constant: IConstant) => void;

export function useConstantDialog(
  title: string,
): [
  ReactElement,
  (
    cb: ConstantCallback,
    constants: IAtlasmapDocument | null,
    constant?: IConstant,
  ) => void,
] {
  const [onConstantCb, setOnConstantCb] = useState<ConstantCallback | null>(
    null,
  );
  const [initialConstant, setInitialConstant] = useState<IConstant | null>({
    value: '',
    valueType: constantTypes[0][0],
  });
  const [constants, setConstants] = useState<IAtlasmapDocument | null>(null);
  const { state, toggleOn, toggleOff } = useToggle(false);
  const onConfirm = useCallback(
    (constant: IConstant) => {
      if (onConstantCb) {
        onConstantCb(constant);
        toggleOff();
      }
    },
    [onConstantCb, toggleOff],
  );
  function onValidation(value: string): boolean {
    if (constants) {
      // Ensure constant value is unique
      const fields = constants.fields.filter(
        (fieldOrGroup) => fieldOrGroup.name === value,
      );
      return value === initialConstant?.value || fields.length === 0;
    }
    return true;
  }
  const dialog = (
    <ConstantDialog
      title={title}
      isOpen={state}
      valueTypeOptions={constantTypes.map(([value, label]) => ({
        value,
        label,
      }))}
      onCancel={toggleOff}
      onConfirm={onConfirm}
      onValidation={onValidation}
      {...(initialConstant || {})}
    />
  );
  const onOpenConstantDialog = useCallback(
    (
      callback: ConstantCallback,
      constants: IAtlasmapDocument | null,
      constant?: IConstant,
    ) => {
      // we use a closure to set the state here else React will think that callback
      // is the function to retrieve the state and will call it immediately.
      setOnConstantCb(() => callback);
      if (constant) {
        setInitialConstant(constant);
      }
      if (constants) {
        setConstants(constants);
      }
      toggleOn();
    },
    [toggleOn],
  );
  return [dialog, onOpenConstantDialog];
}

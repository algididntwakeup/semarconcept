import type { UseFormRegister } from 'react-hook-form';
import type { ManageAssetField, ManageAssetFormValues } from './manageAssetFields';

export const manageAssetLabelClass = 'block space-y-1 text-xs font-medium text-slate-600';
export const manageAssetInputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-slate-100 disabled:text-slate-500';

/** A single labelled control driven by the field catalog. */
export const FieldControl = ({
  field,
  register,
  value,
  disabled = false,
}: {
  field: ManageAssetField;
  register: UseFormRegister<ManageAssetFormValues>;
  /** Current value, used by disabledWhenFilled and the radio group. */
  value?: string;
  disabled?: boolean;
}) => {
  const isDisabled = field.readOnly || disabled || (field.disabledWhenFilled && !!value?.trim());
  const spanClass = field.multiline || field.input === 'radio' ? 'sm:col-span-2' : '';

  if (field.input === 'radio') {
    return (
      <fieldset className={`${manageAssetLabelClass} ${spanClass}`}>
        <legend className="text-xs font-medium text-slate-600">{field.label}</legend>
        <div className="mt-1 flex gap-4">
          {(field.options ?? []).map((option) => (
            <label key={option} className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                value={option}
                disabled={isDisabled}
                className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                {...register(field.name)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.input === 'select') {
    return (
      <label className={`${manageAssetLabelClass} ${spanClass}`}>
        {field.label}
        <select disabled={isDisabled} className={manageAssetInputClass} {...register(field.name)}>
          <option value="">Select {field.label.toLowerCase()}…</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.multiline) {
    return (
      <label className={`${manageAssetLabelClass} ${spanClass}`}>
        {field.label}
        <textarea
          rows={3}
          disabled={isDisabled}
          placeholder={field.placeholder}
          className={manageAssetInputClass}
          {...register(field.name)}
        />
      </label>
    );
  }

  return (
    <label className={`${manageAssetLabelClass} ${spanClass}`}>
      {field.label}
      <input
        type={field.input === 'number' ? 'number' : field.input === 'date' ? 'date' : 'text'}
        disabled={isDisabled}
        placeholder={field.placeholder}
        className={manageAssetInputClass}
        {...register(field.name)}
      />
    </label>
  );
};

/** Grid of fields bound to the form. */
export const FieldGrid = ({
  fields,
  register,
  values,
}: {
  fields: ManageAssetField[];
  register: UseFormRegister<ManageAssetFormValues>;
  values: ManageAssetFormValues;
}) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {fields.map((field) => (
      <FieldControl
        key={field.name}
        field={field}
        register={register}
        value={values[field.name]}
        disabled={field.name === 'designEquipmentType'}
      />
    ))}
  </div>
);

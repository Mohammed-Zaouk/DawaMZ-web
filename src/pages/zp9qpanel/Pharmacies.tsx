import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Table,
  Form,
  Input,
  Switch,
  Select,
  Tag,
  Space,
  Button,
  Spin,
  Typography,
  Breadcrumb,
  Empty,
  App,
  Divider,
  Tooltip,
  TimePicker,
} from "antd";
import type { IResourceComponentsProps } from "@refinedev/core";
import { useList, useDelete } from "@refinedev/core";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useEffect } from "react";
import dayjs from "dayjs";

const { Title, Text } = Typography;

// ── Types ──────────────────────────────────────────────────────────────────────

type TimeSlot = { open: string; close: string };
type DaySchedule = TimeSlot[] | null;
type WeekSchedule = Record<string, DaySchedule>;

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const SCHEDULE_DEFAULT: WeekSchedule = {
  monday: [{ open: "08:00", close: "20:00" }],
  tuesday: [{ open: "08:00", close: "20:00" }],
  wednesday: [{ open: "08:00", close: "20:00" }],
  thursday: [{ open: "08:00", close: "20:00" }],
  friday: [{ open: "08:00", close: "20:00" }],
  saturday: [{ open: "09:00", close: "18:00" }],
  sunday: null,
};

// ── Schedule Editor ────────────────────────────────────────────────────────────

interface ScheduleEditorProps {
  value?: WeekSchedule;
  onChange?: (v: WeekSchedule) => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ value, onChange }) => {
  const schedule: WeekSchedule = value ?? SCHEDULE_DEFAULT;

  const emit = (next: WeekSchedule) => onChange?.(next);

  const toggleDay = (day: string) => {
    const current = schedule[day];
    emit({
      ...schedule,
      [day]: current === null ? [{ open: "08:00", close: "20:00" }] : null,
    });
  };

  const addSlot = (day: string) => {
    const slots = schedule[day] as TimeSlot[];
    emit({ ...schedule, [day]: [...slots, { open: "08:00", close: "12:00" }] });
  };

  const removeSlot = (day: string, idx: number) => {
    const slots = (schedule[day] as TimeSlot[]).filter((_, i) => i !== idx);
    emit({ ...schedule, [day]: slots.length > 0 ? slots : null });
  };

  const updateSlot = (
    day: string,
    idx: number,
    field: "open" | "close",
    time: string,
  ) => {
    const slots = [...(schedule[day] as TimeSlot[])];
    slots[idx] = { ...slots[idx], [field]: time };
    emit({ ...schedule, [day]: slots });
  };

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        overflow: "hidden",
        background: "#fafbfc",
      }}
    >
      {DAYS.map((day, di) => {
        const daySlots = schedule[day];
        const isOpen = daySlots !== null;
        const isWeekend = day === "saturday" || day === "sunday";

        return (
          <div
            key={day}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "10px 16px",
              borderBottom: di < DAYS.length - 1 ? "1px solid #e2e8f0" : "none",
              background: isWeekend ? "#f0f7ff" : "#fff",
            }}
          >
            <div
              style={{
                width: 110,
                paddingTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <Switch
                size="small"
                checked={isOpen}
                onChange={() => toggleDay(day)}
              />
              <Text
                strong={isOpen}
                type={isOpen ? undefined : "secondary"}
                style={{ fontSize: 13 }}
              >
                {DAY_LABELS[day]}
              </Text>
            </div>

            <div style={{ flex: 1 }}>
              {!isOpen ? (
                <Tag color="default" style={{ marginTop: 4 }}>
                  Closed
                </Tag>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {(daySlots as TimeSlot[]).map((slot, si) => (
                    <div
                      key={si}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 7,
                        padding: "4px 10px",
                        width: "fit-content",
                      }}
                    >
                      <TimePicker
                        size="small"
                        format="HH:mm"
                        value={dayjs(slot.open, "HH:mm")}
                        onChange={(_, s) =>
                          updateSlot(day, si, "open", s as string)
                        }
                        style={{ width: 90 }}
                        placeholder="Open"
                        allowClear={false}
                        needConfirm={false}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        →
                      </Text>
                      <TimePicker
                        size="small"
                        format="HH:mm"
                        value={dayjs(slot.close, "HH:mm")}
                        onChange={(_, s) =>
                          updateSlot(day, si, "close", s as string)
                        }
                        style={{ width: 90 }}
                        placeholder="Close"
                        allowClear={false}
                        needConfirm={false}
                      />
                      {(daySlots as TimeSlot[]).length > 1 && (
                        <Tooltip title="Remove slot">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<i className="ion-ios-trash" />}
                            onClick={() => removeSlot(day, si)}
                          />
                        </Tooltip>
                      )}
                    </div>
                  ))}

                  {(daySlots as TimeSlot[]).length < 2 && (
                    <Button
                      type="dashed"
                      size="small"
                      icon={<i className="ion-ios-add" />}
                      onClick={() => addSlot(day)}
                      style={{ width: "fit-content", fontSize: 12 }}
                    >
                      Add break slot
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Shared form fields ─────────────────────────────────────────────────────────

interface PharmacyFormFieldsProps {
  citySelectProps: ReturnType<typeof useSelect>["selectProps"];
}

const PharmacyFormFields: React.FC<PharmacyFormFieldsProps> = ({
  citySelectProps,
}) => (
  <>
    <Divider orientation="left" style={{ fontSize: 13, color: "#64748b" }}>
      <i className="ion-ios-information-circle" style={{ marginRight: 6 }} />
      Identity
    </Divider>

    <Form.Item
      label="Name (EN)"
      name="name"
      rules={[{ required: true, message: "English name is required" }]}
    >
      <Input placeholder="e.g. Pharmacy Al Amal" />
    </Form.Item>

    <Form.Item label="Name (AR)" name="name_ar">
      <Input placeholder="e.g. صيدلية الأمل" dir="rtl" />
    </Form.Item>

    <Form.Item
      label="City"
      name="city_id"
      rules={[{ required: true, message: "Please select a city" }]}
    >
      <Select {...citySelectProps} placeholder="Select city" />
    </Form.Item>

    <Form.Item label="Slug" name="slug">
      <Input placeholder="e.g. pharmacy-al-amal" />
    </Form.Item>

    <Divider orientation="left" style={{ fontSize: 13, color: "#64748b" }}>
      <i className="ion-ios-locate" style={{ marginRight: 6 }} />
      Location
    </Divider>

    <Form.Item label="Address (EN)" name="address">
      <Input placeholder="Street address in English" />
    </Form.Item>

    <Form.Item label="Address (AR)" name="address_ar">
      <Input placeholder="العنوان بالعربية" dir="rtl" />
    </Form.Item>

    <Form.Item label="Latitude" name="latitude">
      <Input type="number" placeholder="e.g. 33.9716" />
    </Form.Item>

    <Form.Item label="Longitude" name="longitude">
      <Input type="number" placeholder="e.g. -6.8498" />
    </Form.Item>

    <Divider orientation="left" style={{ fontSize: 13, color: "#64748b" }}>
      <i className="ion-ios-call" style={{ marginRight: 6 }} />
      Contact
    </Divider>

    <Form.Item label="Phone" name="phone">
      <Input placeholder="e.g. +212 600 000000" />
    </Form.Item>

    <Divider orientation="left" style={{ fontSize: 13, color: "#64748b" }}>
      <i className="ion-ios-moon" style={{ marginRight: 6 }} />
      Pharmacy Duty
    </Divider>

    <Form.Item
      label="Night Pharmacy"
      name="is_night_pharmacy"
      valuePropName="checked"
    >
      <Switch />
    </Form.Item>

    <Form.Item label="On Call" name="is_on_call" valuePropName="checked">
      <Switch />
    </Form.Item>

    <Form.Item label="Rating" name="rating">
      <Input type="number" step={0.1} min={0} max={5} placeholder="0.0 – 5.0" />
    </Form.Item>

    <Divider orientation="left" style={{ fontSize: 13, color: "#64748b" }}>
      <i className="ion-ios-calendar" style={{ marginRight: 6 }} />
      Weekly Schedule
    </Divider>

    <Form.Item
      name="schedule"
      help={
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Toggle each day open/closed. Use <strong>Add break slot</strong> for
          split hours (e.g. morning 08:00–12:00, then afternoon 15:00–20:00).
        </span>
      }
    >
      <ScheduleEditor />
    </Form.Item>
  </>
);

// ── Pharmacy List ──────────────────────────────────────────────────────────────

export const PharmacyList: React.FC<IResourceComponentsProps> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: deleteOne } = useDelete();
  const { modal } = App.useApp();

  const cityId = searchParams.get("cityId");
  const cityName = searchParams.get("cityName") ?? "All Cities";

  const { data: pharmaciesData, isLoading: pharmaciesLoading } = useList({
    resource: "pharmacies",
    pagination: { pageSize: 1000 },
    filters: cityId
      ? [{ field: "city_id", operator: "eq", value: cityId }]
      : [],
  });

  const { data: citiesData, isLoading: citiesLoading } = useList({
    resource: "cities",
    pagination: { pageSize: 1000 },
  });

  if (pharmaciesLoading || citiesLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  const pharmacies = pharmaciesData?.data ?? [];
  const cities = citiesData?.data ?? [];

  const getCityName = (id: unknown) => {
    const city = cities.find((c) => String(c.id) === String(id));
    return city ? String(city.name) : "—";
  };

  const handleDelete = (id: string | number) => {
    modal.confirm({
      title: "Delete Pharmacy",
      icon: <i className="ion-ios-warning" />,
      content: "Are you sure you want to delete this pharmacy?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        deleteOne({
          resource: "pharmacies",
          id,
          mutationMode: "optimistic",
          successNotification: { message: "Pharmacy deleted", type: "success" },
        });
      },
    });
  };

  const columns = [
    {
      title: "Name (EN)",
      dataIndex: "name",
      key: "name",
      render: (v: unknown) => <Text strong>{v as string}</Text>,
    },
    {
      title: "Name (AR)",
      dataIndex: "name_ar",
      key: "name_ar",
      render: (v: unknown) => (
        <span dir="rtl" style={{ fontFamily: "serif" }}>
          {(v as string) || "—"}
        </span>
      ),
    },
    {
      title: "Address (EN)",
      dataIndex: "address",
      key: "address",
      render: (v: unknown) => (v as string) || "—",
    },
    {
      title: "Address (AR)",
      dataIndex: "address_ar",
      key: "address_ar",
      render: (v: unknown) => (
        <span dir="rtl" style={{ fontFamily: "serif" }}>
          {(v as string) || "—"}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (v: unknown) => (v as string) || "—",
    },
    {
      title: "City",
      dataIndex: "city_id",
      key: "city_id",
      render: (v: unknown) => getCityName(v),
    },
    {
      title: "Duty",
      key: "duty",
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space size={4}>
          {record.is_night_pharmacy ? (
            <Tooltip title="Night Pharmacy">
              <Tag color="blue" style={{ margin: 0 }}>
                <i className="ion-ios-moon" style={{ marginRight: 3 }} />
                Night
              </Tag>
            </Tooltip>
          ) : null}
          {record.is_on_call ? (
            <Tooltip title="On Call">
              <Tag color="orange" style={{ margin: 0 }}>
                <i className="ion-ios-call" style={{ marginRight: 3 }} />
                On Call
              </Tag>
            </Tooltip>
          ) : null}
          {!record.is_night_pharmacy && !record.is_on_call ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              —
            </Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<i className="ion-ios-compose" />}
              size="small"
              onClick={() =>
                navigate(`/zp9qpanel/pharmacies/edit/${record.id}`)
              }
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<i className="ion-ios-trash" />}
              size="small"
              danger
              onClick={() => handleDelete(record.id as string)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const visibleColumns = cityId
    ? columns.filter((c) => c.key !== "city_id")
    : columns;

  return (
    <div dir="ltr">
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <span
                style={{ cursor: "pointer", color: "#1976d2" }}
                onClick={() => navigate("/zp9qpanel/regions")}
              >
                Regions
              </span>
            ),
          },
          ...(cityId
            ? [{ title: <Text type="secondary">{cityName}</Text> }]
            : []),
          { title: "Pharmacies" },
        ]}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {cityId && (
            <Button
              icon={<i className="ion-ios-arrow-back" />}
              onClick={() => navigate("/zp9qpanel/regions")}
              size="small"
            />
          )}
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {cityId ? (
                <Space>
                  <i className="ion-ios-locate" style={{ color: "#1976d2" }} />
                  {cityName} — Pharmacies
                </Space>
              ) : (
                "All Pharmacies"
              )}
            </Title>
            <Text type="secondary">{pharmacies.length} pharmacies</Text>
          </div>
        </div>

        <Button
          type="primary"
          icon={<i className="ion-ios-add" />}
          onClick={() => {
            const createUrl = cityId
              ? `/zp9qpanel/pharmacies/create?cityId=${cityId}`
              : "/zp9qpanel/pharmacies/create";
            navigate(createUrl);
          }}
        >
          Add Pharmacy
        </Button>
      </div>

      {pharmacies.length === 0 ? (
        <Empty
          description={
            cityId ? `No pharmacies in ${cityName} yet` : "No pharmacies yet"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: "40px 0" }}
        >
          <Button
            type="primary"
            icon={<i className="ion-ios-add" />}
            onClick={() =>
              navigate(
                cityId
                  ? `/zp9qpanel/pharmacies/create?cityId=${cityId}`
                  : "/zp9qpanel/pharmacies/create",
              )
            }
          >
            Add First Pharmacy
          </Button>
        </Empty>
      ) : (
        <Table
          dataSource={pharmacies}
          columns={visibleColumns}
          rowKey="id"
          size="small"
          scroll={{ x: true }}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ["20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} of ${total} pharmacies`,
          }}
        />
      )}
    </div>
  );
};

// ── Pharmacy Create ────────────────────────────────────────────────────────────

export const PharmacyCreate: React.FC<IResourceComponentsProps> = () => {
  const [searchParams] = useSearchParams();
  const preselectedCityId = searchParams.get("cityId");

  const { formProps, saveButtonProps } = useForm({
    resource: "pharmacies",
    action: "create",
    redirect: "list",
    successNotification: {
      message: "Pharmacy created successfully",
      type: "success",
    },
  });

  const { selectProps: citySelectProps } = useSelect({
    resource: "cities",
    optionLabel: "name",
    optionValue: "id",
  });

  const initialValues = {
    ...(preselectedCityId ? { city_id: preselectedCityId } : {}),
    schedule: SCHEDULE_DEFAULT,
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={initialValues}
        requiredMark
      >
        <PharmacyFormFields citySelectProps={citySelectProps} />
      </Form>
    </Create>
  );
};

// ── Pharmacy Edit ──────────────────────────────────────────────────────────────

export const PharmacyEdit: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParams();

  const { formProps, saveButtonProps, query } = useForm({
    resource: "pharmacies",
    action: "edit",
    id,
    redirect: "list",
    successNotification: {
      message: "Pharmacy updated successfully",
      type: "success",
    },
  });

  const { selectProps: citySelectProps } = useSelect({
    resource: "cities",
    optionLabel: "name",
    optionValue: "id",
  });

  useEffect(() => {
    if (query?.data?.data) {
      const record = query.data.data;
      formProps.form?.setFieldsValue({
        ...record,
        schedule: record.schedule ?? SCHEDULE_DEFAULT,
      });
    }
  }, [query?.data?.data, formProps.form]);

  if (query?.isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" requiredMark>
        <PharmacyFormFields citySelectProps={citySelectProps} />
      </Form>
    </Edit>
  );
};

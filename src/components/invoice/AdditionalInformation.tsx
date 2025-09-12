
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdditionalInformationProps {
  approver: string;
  priority: string;
  tags: string[];
}

export const AdditionalInformation = ({ approver, priority, tags }: AdditionalInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Approved By</p>
            <p>{approver}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Priority</p>
            <span className={`px-2 py-1 rounded-full text-xs inline-block ${
              priority === 'High' ? 'bg-red-100 text-red-800' : 
              priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'
            }`}>
              {priority}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="text-gray-700">
              Please reference invoice number in all communications. Contact vendor accounting department for any discrepancies.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
